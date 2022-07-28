const {User} = require('../models');

const resolvers = {
  Query: {
    async getSingleUser(parent, { user = null, params }) {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });
  
        return foundUser;
    },
  },
  Mutation: {
    async createUser(parent, { body }) {
      const user = await User.create(body);
      const token = signToken(user);
      return({ token, user });
    }, 
    async login(parent, { body }) {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
  
      const correctPw = await user.isCorrectPassword(body.password);
      const token = signToken(user);
      return { token, user };
    },
    async saveBook(parent, { user, body }) {
      console.log(user);
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return (updatedUser);
      
    },
    async deleteBook(parent, { user, params }) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      ); 
      return (updatedUser);
    },
  }
}

module.exports = resolvers;