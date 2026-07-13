const Profile = require('../models/Profile');

exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, title, bio, fullBio, image, image2, yearsExperience, achievements, milestones, socialMedia, contact, exchangeRate, budgetRanges } = req.body;
    const profileData = { name, title, bio, fullBio, image, image2, yearsExperience, achievements, milestones, socialMedia, contact, exchangeRate, budgetRanges };
    Object.keys(profileData).forEach(k => profileData[k] === undefined && delete profileData[k]);
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(profileData);
    } else {
      Object.assign(profile, profileData);
      await profile.save();
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
