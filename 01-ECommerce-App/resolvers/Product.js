exports.Product = {
  category: (parent, args, { categories }, info) => {
    return categories.find((category) => parent.categoryId === category.id);
  },
  reviews: (parent, args, { reviews }, info) => {
    return reviews.filter((review) => review.productId === parent.id);
  },
};
