const { AuthenticationError } = require("apollo-server-errors");
const { User } = require('../models');
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    getSingleUser: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('Please log in!');
    }
  },
  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Email address not found!');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { authors, description, bookId, image, link, title }, context) => {
      if (context.user) {
        const user = await User.findOneAndUpdate({ _id: context.user._id }, { $addToSet: {
            savedBooks: {
                authors: authors,
                description: description,
                bookId: bookId,
                image: image,
                link: link,
                title: title
            }
        }});
        return user;;
    }
    throw new AuthenticationError('Please login to view this content!');
  },
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: {savedBooks: {bookId: bookId} } }
        );
      return User;
    }
    throw new AuthenticationError('Please login to view this content!');
  }
}
};

module.exports = resolvers;