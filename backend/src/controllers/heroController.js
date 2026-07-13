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
    const { badge, title, subtitle, primaryBtnText, primaryBtnAction, secondaryBtnText, secondaryBtnAction, isActive, stat1, stat2 } = req.body;
    const heroData = { badge, title, subtitle, primaryBtnText, primaryBtnAction, secondaryBtnText, secondaryBtnAction, isActive, stat1, stat2 };
    Object.keys(heroData).forEach(k => heroData[k] === undefined && delete heroData[k]);
    let hero = await HeroContent.findOne();
    if (!hero) {
      hero = await HeroContent.create(heroData);
    } else {
      Object.assign(hero, heroData);
      await hero.save();
    }
    res.json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
};
