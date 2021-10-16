exports.Category = {
  products: (parent, args, { products }, info) => {
    return products.filter((product) => product.categoryId === parent.id);
  },
};
