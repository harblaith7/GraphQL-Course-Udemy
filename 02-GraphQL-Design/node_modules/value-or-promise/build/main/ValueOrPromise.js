"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueOrPromise = void 0;
function isPromiseLike(object) {
    return (object != null && typeof object.then === 'function');
}
const defaultOnRejectedFn = (reason) => {
    throw reason;
};
class ValueOrPromise {
    constructor(executor) {
        let value;
        try {
            value = executor();
        }
        catch (reason) {
            this.state = { status: 'rejected', value: reason };
            return;
        }
        if (isPromiseLike(value)) {
            this.state = { status: 'pending', value };
            return;
        }
        this.state = { status: 'fulfilled', value };
    }
    then(onFulfilled, onRejected) {
        const state = this.state;
        if (state.status === 'pending') {
            return new ValueOrPromise(() => state.value.then(onFulfilled, onRejected));
        }
        const onRejectedFn = typeof onRejected === 'function' ? onRejected : defaultOnRejectedFn;
        if (state.status === 'rejected') {
            return new ValueOrPromise(() => onRejectedFn(state.value));
        }
        try {
            const onFulfilledFn = typeof onFulfilled === 'function' ? onFulfilled : undefined;
            return onFulfilledFn === undefined
                ? new ValueOrPromise(() => state.value)
                : new ValueOrPromise(() => onFulfilledFn(state.value));
        }
        catch (e) {
            return new ValueOrPromise(() => onRejectedFn(e));
        }
    }
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
    resolve() {
        const state = this.state;
        if (state.status === 'pending') {
            return Promise.resolve(state.value);
        }
        if (state.status === 'rejected') {
            throw state.value;
        }
        return state.value;
    }
    static all(valueOrPromises) {
        const values = [];
        for (let i = 0; i < valueOrPromises.length; i++) {
            const valueOrPromise = valueOrPromises[i];
            const state = valueOrPromise.state;
            if (state.status === 'rejected') {
                return new ValueOrPromise(() => {
                    throw state.value;
                });
            }
            if (state.status === 'pending') {
                return new ValueOrPromise(() => Promise.all(valueOrPromises.slice(i)).then((resolvedPromises) => values.concat(resolvedPromises)));
            }
            values.push(state.value);
        }
        return new ValueOrPromise(() => values);
    }
}
exports.ValueOrPromise = ValueOrPromise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFsdWVPclByb21pc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVmFsdWVPclByb21pc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsU0FBUyxhQUFhLENBQUksTUFBZTtJQUN2QyxPQUFPLENBQ0wsTUFBTSxJQUFJLElBQUksSUFBSSxPQUFRLE1BQXlCLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FDeEUsQ0FBQztBQUNKLENBQUM7QUFtQkQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLE1BQWUsRUFBRSxFQUFFO0lBQzlDLE1BQU0sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBYSxjQUFjO0lBR3pCLFlBQVksUUFBa0M7UUFDNUMsSUFBSSxLQUF5QixDQUFDO1FBRTlCLElBQUk7WUFDRixLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7U0FDcEI7UUFBQyxPQUFPLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNuRCxPQUFPO1NBQ1I7UUFFRCxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUMxQyxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRU0sSUFBSSxDQUNULFdBR1EsRUFDUixVQUdRO1FBRVIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUV6QixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxjQUFjLENBQUMsR0FBRyxFQUFFLENBQzdCLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxD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