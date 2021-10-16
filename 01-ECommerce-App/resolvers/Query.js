exports.Query = {
  products: (parent, args, { products, reviews }, info) => {
    console.log(info);
    if (args.filter && args.filter.rating) {
      return products.filter((product) => {
        const productReviews = reviews.filter(
          (review) => review.productId === product.id
        );
        const productRating =
          productReviews.reduce((acc, review) => {
            return (acc += review.rating);
          }, 0) / productReviews.length;
        return productRating >= args.filter.rating;
      });
    }
    return products;
  },
  product: (parent, { id }, { products }, info) => {
    return products.find((product) => product.id === id);
  },
  categories: () => categories,
  category: (parent, { id }, { categories }, info) => {
    return categories.find((category) => category.id === id);
  },
};
