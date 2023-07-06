import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDf0yO_wub1QerbuzNtnfd6-ZTRSmxPWZUYA&usqp=CAU",
  },
  categories: {
    type: [String],
    required: true
  }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
