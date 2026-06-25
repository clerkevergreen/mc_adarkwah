const HeroContent = require('../models/HeroContent');

exports.getHeroContent = async (req, res, next) => {
  try {
    let hero = await HeroContent.findOne({ isActive: true });
    if (!hero) {
      hero = await HeroContent.create({});
    }
    res.json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
};

exports.updateHeroContent = async (req, res, next) => {
  try {
    let hero = await HeroContent.findOne();
    if (!hero) {
      hero = await HeroContent.create(req.body);
    } else {
      Object.assign(hero, req.body);
      await hero.save();
    }
    res.json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
};
