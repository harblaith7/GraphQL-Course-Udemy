function isPromiseLike(object) {
    return (object != null && typeof object.then === 'function');
}
const defaultOnRejectedFn = (reason) => {
    throw reason;
};
export class ValueOrPromise {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFsdWVPclByb21pc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVmFsdWVPclByb21pc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxhQUFhLENBQUksTUFBZTtJQUN2QyxPQUFPLENBQ0wsTUFBTSxJQUFJLElBQUksSUFBSSxPQUFRLE1BQXlCLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FDeEUsQ0FBQztBQUNKLENBQUM7QUFtQkQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLE1BQWUsRUFBRSxFQUFFO0lBQzlDLE1BQU0sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxPQUFPLGNBQWM7SUFHekIsWUFBWSxRQUFrQztRQUM1QyxJQUFJLEtBQXlCLENBQUM7UUFFOUIsSUFBSTtZQUNGLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztTQUNwQjtRQUFDLE9BQU8sTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ25ELE9BQU87U0FDUjtRQUVELElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzFDLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFTSxJQUFJLENBQ1QsV0FHUSxFQUNSLFVBR1E7UUFFUixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRXpCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDOUIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FDN0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJ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