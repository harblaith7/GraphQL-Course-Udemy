'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const graphql = require('graphql');
const utils = require('@graphql-tools/utils/es5');
const tslib = require('tslib');
const merge = require('@graphql-tools/merge/es5');

function assertResolversPresent(schema, resolverValidationOptions) {
    if (resolverValidationOptions === void 0) { resolverValidationOptions = {}; }
    var requireResolversForArgs = resolverValidationOptions.requireResolversForArgs, requireResolversForNonScalar = resolverValidationOptions.requireResolversForNonScalar, requireResolversForAllFields = resolverValidationOptions.requireResolversForAllFields;
    if (requireResolversForAllFields && (requireResolversForArgs || requireResolversForNonScalar)) {
        throw new TypeError('requireResolversForAllFields takes precedence over the more specific assertions. ' +
            'Please configure either requireResolversForAllFields or requireResolversForArgs / ' +
            'requireResolversForNonScalar, but not a combination of them.');
    }
    utils.forEachField(schema, function (field, typeName, fieldName) {
        // requires a resolver for *every* field.
        if (requireResolversForAllFields) {
            expectResolver('requireResolversForAllFields', requireResolversForAllFields, field, typeName, fieldName);
        }
        // requires a resolver on every field that has arguments
        if (requireResolversForArgs && field.args.length > 0) {
            expectResolver('requireResolversForArgs', requireResolversForArgs, field, typeName, fieldName);
        }
        // requires a resolver on every field that returns a non-scalar type
        if (requireResolversForNonScalar !== 'ignore' && !graphql.isScalarType(graphql.getNamedType(field.type))) {
            expectResolver('requireResolversForNonScalar', requireResolversForNonScalar, field, typeName, fieldName);
        }
    });
}
function expectResolver(validator, behavior, field, typeName, fieldName) {
    if (!field.resolve) {
        var message = "Resolver missing for \"" + typeName + "." + fieldName + "\".\nTo disable this validator, use:\n  resolverValidationOptions: {\n    " + validator + ": 'ignore'\n  }";
        if (behavior === 'error') {
            throw new Error(message);
        }
        if (behavior === 'warn') {
            // eslint-disable-next-line no-console
            console.warn(message);
        }
        return;
    }
    if (typeof field.resolve !== 'function') {
        throw new Error("Resolver \"" + typeName + "." + fieldName + "\" must be a function");
    }
}

function chainResolvers(resolvers) {
    return function (root, args, ctx, info) {
        return resolvers.reduce(function (prev, curResolver) {
            if (curResolver != null) {
                return curResolver(prev, args, ctx, info);
            }
            return graphql.defaultFieldResolver(prev, args, ctx, info);
        }, root);
    };
}

// If we have any union or interface types throw if no there is no resolveType resolver
function checkForResolveTypeResolver(schema, requireResolversForResolveType) {
    var _a;
    utils.mapSchema(schema, (_a = {},
        _a[utils.MapperKind.ABSTRACT_TYPE] = function (type) {
            if (!type.resolveType) {
                var message = "Type \"" + type.name + "\" is missing a \"__resolveType\" resolver. Pass 'ignore' into " +
                    '"resolverValidationOptions.requireResolversForResolveType" to disable this error.';
                if (requireResolversForResolveType === 'error') {
                    throw new Error(message);
                }
                if (requireResolversForResolveType === 'warn') {
                    // eslint-disable-next-line no-console
                    console.warn(message);
                }
            }
            return undefined;
        },
        _a));
}

function extendResolversFromInterfaces(schema, resolvers) {
    var e_1, _a;
    var extendedResolvers = {};
    var typeMap = schema.getTypeMap();
    for (var typeName in typeMap) {
        var type = typeMap[typeName];
        if ('getInterfaces' in type) {
            extendedResolvers[typeName] = {};
            try {
                for (var _b = (e_1 = void 0, tslib.__values(type.getInterfaces())), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var iFace = _c.value;
                    if (resolvers[iFace.name]) {
                        for (var fieldName in resolvers[iFace.name]) {
                            if (fieldName === '__isTypeOf' || !fieldName.startsWith('__')) {
                                extendedResolvers[typeName][fieldName] = resolvers[iFace.name][fieldName];
                            }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var typeResolvers = resolvers[typeName];
            extendedResolvers[typeName] = tslib.__assign(tslib.__assign({}, extendedResolvers[typeName]), typeResolvers);
        }
        else {
            var typeResolvers = resolvers[typeName];
            if (typeResolvers != null) {
                extendedResolvers[typeName] = typeResolvers;
            }
        }
    }
    return extendedResolvers;
}

function addResolversToSchema(schemaOrOptions, legacyInputResolvers, legacyInputValidationOptions) {
    var options = graphql.isSchema(schemaOrOptions)
        ? {
            schema: schemaOrOptions,
            resolvers: legacyInputResolvers !== null && legacyInputResolvers !== void 0 ? legacyInputResolvers : {},
            resolverValidationOptions: legacyInputValidationOptions,
        }
        : schemaOrOptions;
    var schema = options.schema, inputResolvers = options.resolvers, defaultFieldResolver = options.defaultFieldResolver, _a = options.resolverValidationOptions, resolverValidationOptions = _a === void 0 ? {} : _a, _b = options.inheritResolversFromInterfaces, inheritResolversFromInterfaces = _b === void 0 ? false : _b, _c = options.updateResolversInPlace, updateResolversInPlace = _c === void 0 ? false : _c;
    var _d = resolverValidationOptions.requireResolversToMatchSchema, requireResolversToMatchSchema = _d === void 0 ? 'error' : _d, requireResolversForResolveType = resolverValidationOptions.requireResolversForResolveType;
    var resolvers = inheritResolversFromInterfaces
        ? extendResolversFromInterfaces(schema, inputResolvers)
        : inputResolvers;
    for (var typeName in resolvers) {
        var resolverValue = resolvers[typeName];
        var resolverType = typeof resolverValue;
        if (resolverType !== 'object') {
            throw new Error("\"" + typeName + "\" defined in resolvers, but has invalid value \"" + resolverValue + "\". The resolver's value must be of type object.");
        }
        var type = schema.getType(typeName);
        if (type == null) {
            if (requireResolversToMatchSchema === 'ignore') {
                break;
            }
            throw new Error("\"" + typeName + "\" defined in resolvers, but not in schema");
        }
        else if (graphql.isSpecifiedScalarType(type)) {
            // allow -- without recommending -- overriding of specified scalar types
            for (var fieldName in resolverValue) {
                if (fieldName.startsWith('__')) {
                    type[fieldName.substring(2)] = resolverValue[fieldName];
                }
                else {
                    type[fieldName] = resolverValue[fieldName];
                }
            }
        }
        else if (graphql.isEnumType(type)) {
            var values = type.getValues();
            var _loop_1 = function (fieldName) {
                if (!fieldName.startsWith('__') &&
                    !values.some(function (value) { return value.name === fieldName; }) &&
                    requireResolversToMatchSchema &&
                    requireResolversToMatchSchema !== 'ignore') {
                    throw new Error(type.name + "." + fieldName + " was defined in resolvers, but not present within " + type.name);
                }
            };
            for (var fieldName in resolverValue) {
                _loop_1(fieldName);
            }
        }
        else if (graphql.isUnionType(type)) {
            for (var fieldName in resolverValue) {
                if (!fieldName.startsWith('__') &&
                    requireResolversToMatchSchema &&
                    requireResolversToMatchSchema !== 'ignore') {
                    throw new Error(type.name + "." + fieldName + " was defined in resolvers, but " + type.name + " is not an object or interface type");
                }
            }
        }
        else if (graphql.isObjectType(type) || graphql.isInterfaceType(type)) {
            for (var fieldName in resolverValue) {
                if (!fieldName.startsWith('__')) {
                    var fields = type.getFields();
                    var field = fields[fieldName];
                    if (field == null) {
                        // Field present in resolver but not in schema
                        if (requireResolversToMatchSchema && requireResolversToMatchSchema !== 'ignore') {
                            throw new Error(typeName + "." + fieldName + " defined in resolvers, but not in schema");
                        }
                    }
                    else {
                        // Field present in both the resolver and schema
                        var fieldResolve = resolverValue[fieldName];
                        if (typeof fieldResolve !== 'function' && typeof fieldResolve !== 'object') {
                            throw new Error("Resolver " + typeName + "." + fieldName + " must be object or function");
                        }
                    }
                }
            }
        }
    }
    schema = updateResolversInPlace
        ? addResolversToExistingSchema(schema, resolvers, defaultFieldResolver)
        : createNewSchemaWithResolvers(schema, resolvers, defaultFieldResolver);
    if (requireResolversForResolveType && requireResolversForResolveType !== 'ignore') {
        checkForResolveTypeResolver(schema, requireResolversForResolveType);
    }
    return schema;
}
function addResolversToExistingSchema(schema, resolvers, defaultFieldResolver) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var typeMap = schema.getTypeMap();
    for (var typeName in resolvers) {
        var type = schema.getType(typeName);
        var resolverValue = resolvers[typeName];
        if (graphql.isScalarType(type)) {
            for (var fieldName in resolverValue) {
                if (fieldName.startsWith('__')) {
                    type[fieldName.substring(2)] = resolverValue[fieldName];
                }
                else if (fieldName === 'astNode' && type.astNode != null) {
                    type.astNode = tslib.__assign(tslib.__assign({}, type.astNode), { description: (_c = (_b = (_a = resolverValue) === null || _a === void 0 ? void 0 : _a.astNode) === null || _b === void 0 ? void 0 : _b.description) !== null && _c !== void 0 ? _c : type.astNode.description, directives: ((_d = type.astNode.directives) !== null && _d !== void 0 ? _d : []).concat((_g = (_f = (_e = resolverValue) === null || _e === void 0 ? void 0 : _e.astNode) === null || _f === void 0 ? void 0 : _f.directives) !== null && _g !== void 0 ? _g : []) });
                }
                else if (fieldName === 'extensionASTNodes' && type.extensionASTNodes != null) {
                    type.extensionASTNodes = type.extensionASTNodes.concat((_j = (_h = resolverValue) === null || _h === void 0 ? void 0 : _h.extensionASTNodes) !== null && _j !== void 0 ? _j : []);
                }
                else if (fieldName === 'extensions' &&
                    type.extensions != null &&
                    resolverValue.extensions != null) {
                    type.extensions = Object.assign(Object.create(null), type.extensions, resolverValue.extensions);
                }
                else {
                    type[fieldName] = resolverValue[fieldName];
                }
            }
        }
        else if (graphql.isEnumType(type)) {
            var config = type.toConfig();
            var enumValueConfigMap = config.values;
            for (var fieldName in resolverValue) {
                if (fieldName.startsWith('__')) {
                    config[fieldName.substring(2)] = resolverValue[fieldName];
                }
                else if (fieldName === 'astNode' && config.astNode != null) {
                    config.astNode = tslib.__assign(tslib.__assign({}, config.astNode), { description: (_m = (_l = (_k = resolverValue) === null || _k === void 0 ? void 0 : _k.astNode) === null || _l === void 0 ? void 0 : _l.description) !== null && _m !== void 0 ? _m : config.astNode.description, directives: ((_o = config.astNode.directives) !== null && _o !== void 0 ? _o : []).concat((_r = (_q = (_p = resolverValue) === null || _p === void 0 ? void 0 : _p.astNode) === null || _q === void 0 ? void 0 : _q.directives) !== null && _r !== void 0 ? _r : []) });
                }
                else if (fieldName === 'extensionASTNodes' && config.extensionASTNodes != null) {
                    config.extensionASTNodes = config.extensionASTNodes.concat((_t = (_s = resolverValue) === null || _s === void 0 ? void 0 : _s.extensionASTNodes) !== null && _t !== void 0 ? _t : []);
                }
                else if (fieldName === 'extensions' &&
                    type.extensions != null &&
                    resolverValue.extensions != null) {
                    type.extensions = Object.assign(Object.create(null), type.extensions, resolverValue.extensions);
                }
                else if (enumValueConfigMap[fieldName]) {
                    enumValueConfigMap[fieldName].value = resolverValue[fieldName];
                }
            }
            typeMap[typeName] = new graphql.GraphQLEnumType(config);
        }
        else if (graphql.isUnionType(type)) {
            for (var fieldName in resolverValue) {
                if (fieldName.startsWith('__')) {
                    type[fieldName.substring(2)] = resolverValue[fieldName];
                }
            }
        }
        else if (graphql.isObjectType(type) || graphql.isInterfaceType(type)) {
            for (var fieldName in resolverValue) {
                if (fieldName.startsWith('__')) {
                    // this is for isTypeOf and resolveType and all the other stuff.
                    type[fieldName.substring(2)] = resolverValue[fieldName];
                    break;
                }
                var fields = type.getFields();
                var field = fields[fieldName];
                if (field != null) {
                    var fieldResolve = resolverValue[fieldName];
                    if (typeof fieldResolve === 'function') {
                        // for convenience. Allows shorter syntax in resolver definition file
                        field.resolve = fieldResolve.bind(resolverValue);
                    }
                    else {
                        setFieldProperties(field, fieldResolve);
                    }
                }
            }
        }
    }
    // serialize all default values prior to healing fields with new scalar/enum types.
    utils.forEachDefaultValue(schema, utils.serializeInputValue);
    // schema may have new scalar/enum types that require healing
    utils.healSchema(schema);
    // reparse all default values with new parsing functions.
    utils.forEachDefaultValue(schema, utils.parseInputValue);
    if (defaultFieldResolver != null) {
        utils.forEachField(schema, function (field) {
            if (!field.resolve) {
                field.resolve = defaultFieldResolver;
            }
        });
    }
    return schema;
}
function createNewSchemaWithResolvers(schema, resolvers, defaultFieldResolver) {
    var _a, _b;
    schema = utils.mapSchema(schema, (_a = {},
        _a[utils.MapperKind.SCALAR_TYPE] = function (type) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var config = type.toConfig();
            var resolverValue = resolvers[type.name];
            if (!graphql.isSpecifiedScalarType(type) && resolverValue != null) {
                for (var fieldName in resolverValue) {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else if (fieldName === 'astNode' && config.astNode != null) {
                        config.astNode = tslib.__assign(tslib.__assign({}, config.astNode), { description: (_c = (_b = (_a = resolverValue) === null || _a === void 0 ? void 0 : _a.astNode) === null || _b === void 0 ? void 0 : _b.description) !== null && _c !== void 0 ? _c : config.astNode.description, directives: ((_d = config.astNode.directives) !== null && _d !== void 0 ? _d : []).concat((_g = (_f = (_e = resolverValue) === null || _e === void 0 ? void 0 : _e.astNode) === null || _f === void 0 ? void 0 : _f.directives) !== null && _g !== void 0 ? _g : []) });
                    }
                    else if (fieldName === 'extensionASTNodes' && config.extensionASTNodes != null) {
                        config.extensionASTNodes = config.extensionASTNodes.concat((_j = (_h = resolverValue) === null || _h === void 0 ? void 0 : _h.extensionASTNodes) !== null && _j !== void 0 ? _j : []);
                    }
                    else if (fieldName === 'extensions' &&
                        config.extensions != null &&
                        resolverValue.extensions != null) {
                        config.extensions = Object.assign(Object.create(null), type.extensions, resolverValue.extensions);
                    }
                    else {
                        config[fieldName] = resolverValue[fieldName];
                    }
                }
                return new graphql.GraphQLScalarType(config);
            }
        },
        _a[utils.MapperKind.ENUM_TYPE] = function (type) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var resolverValue = resolvers[type.name];
            var config = type.toConfig();
            var enumValueConfigMap = config.values;
            if (resolverValue != null) {
                for (var fieldName in resolverValue) {
                    if (fieldName.startsWith('__')) {
                        config[fieldName.substring(2)] = resolverValue[fieldName];
                    }
                    else if (fieldName === 'astNode' && config.astNode != null) {
                        config.astNode = tslib.__assign(tslib.__assign({}, config.astNode), { description: (_c = (_b = (_a = resolverValue) === null || _a === void 0 ? void 0 : _a.astNode) === null || _b === void 0 ? void 0 : _b.description) !== null && _c !== void 0 ? _c : config.astNode.description, directives: ((_d = config.astNode.directives) !== null && _d !== void 0 ? _d : []).concat((_g = (_f = (_e = resolverValue) === null || _e === void 0 ? void 0 : _e.astNode) === null || _f === void 0 ? void 0 : _f.directives) !== null && _g !== void 0 ? _g : []) });
                    }
                    else if (fieldName === 'extensionASTNodes' && config.extensionASTNodes != null) {
                        config.extensionASTNodes = config.extensionASTNodes.concat((_j = (_h = resolverValue) === null || _h === void 0 ? void 0 : _h.extensionASTNodes) !== null && _j !== void 0 ? _j : []);
                    }
                    else if (fieldName === 'extensions' &&
                        config.extensions != null &&
                        resolverValue.extensions != null) {
                        config.extensions = Object.assign(Object.create(null), type.extensions, resolverValue.extensions);
                    }
                    else if (enumValueConfigMap[fieldName]) {
                        enumValueConfigMap[fieldName].value = resolverValue[fieldName];
                    }
                }
                return new graphql.GraphQLEnumType(config);
            }
        },
        _a[utils.MapperKind.UNION_TYPE] = function (type) {
            var resolverValue = resolvers[type.name];
            if (resolverValue != null) {
                var config = type.toConfig();
                if (resolverValue['__resolveType']) {
                    config.resolveType = resolverValue['__resolveType'];
                }
                return new graphql.GraphQLUnionType(config);
            }
        },
        _a[utils.MapperKind.OBJECT_TYPE] = function (type) {
            var resolverValue = resolvers[type.name];
            if (resolverValue != null) {
                var config = type.toConfig();
                if (resolverValue['__isTypeOf']) {
                    config.isTypeOf = resolverValue['__isTypeOf'];
                }
                return new graphql.GraphQLObjectType(config);
            }
        },
        _a[utils.MapperKind.INTERFACE_TYPE] = function (type) {
            var resolverValue = resolvers[type.name];
            if (resolverValue != null) {
                var config = type.toConfig();
                if (resolverValue['__resolveType']) {
                    config.resolveType = resolverValue['__resolveType'];
                }
                return new graphql.GraphQLInterfaceType(config);
            }
        },
        _a[utils.MapperKind.COMPOSITE_FIELD] = function (fieldConfig, fieldName, typeName) {
            var resolverValue = resolvers[typeName];
            if (resolverValue != null) {
                var fieldResolve = resolverValue[fieldName];
                if (fieldResolve != null) {
                    var newFieldConfig = tslib.__assign({}, fieldConfig);
                    if (typeof fieldResolve === 'function') {
                        // for convenience. Allows shorter syntax in resolver definition file
                        newFieldConfig.resolve = fieldResolve.bind(resolverValue);
                    }
                    else {
                        setFieldProperties(newFieldConfig, fieldResolve);
                    }
                    return newFieldConfig;
                }
            }
        },
        _a));
    if (defaultFieldResolver != null) {
        schema = utils.mapSchema(schema, (_b = {},
            _b[utils.MapperKind.OBJECT_FIELD] = function (fieldConfig) { return (tslib.__assign(tslib.__assign({}, fieldConfig), { resolve: fieldConfig.resolve != null ? fieldConfig.resolve : defaultFieldResolver })); },
            _b));
    }
    return schema;
}
function setFieldProperties(field, propertiesObj) {
    for (var propertyName in propertiesObj) {
        field[propertyName] = propertiesObj[propertyName];
    }
}

/**
 * Builds a schema from the provided type definitions and resolvers.
 *
 * The type definitions are written using Schema Definition Language (SDL). They
 * can be provided as a string, a `DocumentNode`, a function, or an array of any
 * of these. If a function is provided, it will be passed no arguments and
 * should return an array of strings or `DocumentNode`s.
 *
 * Note: You can use `graphql-tag` to not only parse a string into a
 * `DocumentNode` but also to provide additional syntax highlighting in your
 * editor (with the appropriate editor plugin).
 *
 * ```js
 * const typeDefs = gql`
 *   type Query {
 *     posts: [Post]
 *     author(id: Int!): Author
 *   }
 * `;
 * ```
 *
 * The `resolvers` object should be a map of type names to nested object, which
 * themselves map the type's fields to their appropriate resolvers.
 * See the [Resolvers](/docs/resolvers) section of the documentation for more details.
 *
 * ```js
 * const resolvers = {
 *   Query: {
 *     posts: (obj, args, ctx, info) => getAllPosts(),
 *     author: (obj, args, ctx, info) => getAuthorById(args.id)
 *   }
 * };
 * ```
 *
 * Once you've defined both the `typeDefs` and `resolvers`, you can create your
 * schema:
 *
 * ```js
 * const schema = makeExecutableSchema({
 *   typeDefs,
 *   resolvers,
 * })
 * ```
 */
function makeExecutableSchema(_a) {
    var typeDefs = _a.typeDefs, _b = _a.resolvers, resolvers = _b === void 0 ? {} : _b, _c = _a.resolverValidationOptions, resolverValidationOptions = _c === void 0 ? {} : _c, _d = _a.parseOptions, parseOptions = _d === void 0 ? {} : _d, _e = _a.inheritResolversFromInterfaces, inheritResolversFromInterfaces = _e === void 0 ? false : _e, pruningOptions = _a.pruningOptions, _f = _a.updateResolversInPlace, updateResolversInPlace = _f === void 0 ? false : _f, schemaExtensions = _a.schemaExtensions;
    // Validate and clean up arguments
    if (typeof resolverValidationOptions !== 'object') {
        throw new Error('Expected `resolverValidationOptions` to be an object');
    }
    if (!typeDefs) {
        throw new Error('Must provide typeDefs');
    }
    var schema;
    if (graphql.isSchema(typeDefs)) {
        schema = typeDefs;
    }
    else if (parseOptions === null || parseOptions === void 0 ? void 0 : parseOptions.commentDescriptions) {
        var mergedTypeDefs = merge.mergeTypeDefs(typeDefs, tslib.__assign(tslib.__assign({}, parseOptions), { commentDescriptions: true }));
        schema = graphql.buildSchema(mergedTypeDefs, parseOptions);
    }
    else {
        var mergedTypeDefs = merge.mergeTypeDefs(typeDefs, parseOptions);
        schema = graphql.buildASTSchema(mergedTypeDefs, parseOptions);
    }
    if (pruningOptions) {
        schema = utils.pruneSchema(schema);
    }
    // We allow passing in an array of resolver maps, in which case we merge them
    schema = addResolversToSchema({
        schema: schema,
        resolvers: merge.mergeResolvers(resolvers),
        resolverValidationOptions: resolverValidationOptions,
        inheritResolversFromInterfaces: inheritResolversFromInterfaces,
        updateResolversInPlace: updateResolversInPlace,
    });
    if (Object.keys(resolverValidationOptions).length > 0) {
        assertResolversPresent(schema, resolverValidationOptions);
    }
    if (schemaExtensions) {
        schemaExtensions = merge.mergeExtensions(utils.asArray(schemaExtensions));
        merge.applyExtensions(schema, schemaExtensions);
    }
    return schema;
}

/**
 * Synchronously merges multiple schemas, typeDefinitions and/or resolvers into a single schema.
 * @param config Configuration object
 */
function mergeSchemas(config) {
    var e_1, _a;
    var extractedTypeDefs = utils.asArray(config.typeDefs || []);
    var extractedResolvers = utils.asArray(config.resolvers || []);
    var extractedSchemaExtensions = utils.asArray(config.schemaExtensions || []);
    var schemas = config.schemas || [];
    try {
        for (var schemas_1 = tslib.__values(schemas), schemas_1_1 = schemas_1.next(); !schemas_1_1.done; schemas_1_1 = schemas_1.next()) {
            var schema = schemas_1_1.value;
            extractedTypeDefs.push(schema);
            extractedResolvers.push(utils.getResolversFromSchema(schema));
            extractedSchemaExtensions.push(merge.extractExtensionsFromSchema(schema));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (schemas_1_1 && !schemas_1_1.done && (_a = schemas_1.return)) _a.call(schemas_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return makeExecutableSchema(tslib.__assign(tslib.__assign({ parseOptions: config }, config), { typeDefs: extractedTypeDefs, resolvers: extractedResolvers, schemaExtensions: extractedSchemaExtensions }));
}

exports.addResolversToSchema = addResolversToSchema;
exports.assertResolversPresent = assertResolversPresent;
exports.chainResolvers = chainResolvers;
exports.checkForResolveTypeResolver = checkForResolveTypeResolver;
exports.extendResolversFromInterfaces = extendResolversFromInterfaces;
exports.makeExecutableSchema = makeExecutableSchema;
exports.mergeSchemas = mergeSchemas;
