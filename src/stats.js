import { StatsModel } from './models.js';

let buffer = {
  get: 0,
  post: 0
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const trackRequest = (method) => {
  if (method === 'GET') buffer.get++;
  if (method === 'POST') buffer.post++;
};

export const syncStatsToDB = async () => {
  if (buffer.get === 0 && buffer.post === 0) return;

  const todayStr = getTodayDate();

  try {
    let stats = await StatsModel.findById('global_stats');

    if (!stats) {
      stats = await StatsModel.create({ 
        _id: 'global_stats', 
        today: { date: todayStr, get: 0, post: 0 },
        allTime: { get: 0, post: 0 }
      });
    }

    if (stats.today.date !== todayStr) {
      stats.today.date = todayStr;
      stats.today.get = 0;
      stats.today.post = 0;
    }

    stats.allTime.get += buffer.get;
    stats.allTime.post += buffer.post;
    stats.today.get += buffer.get;
    stats.today.post += buffer.post;

    await stats.save();

    buffer = { get: 0, post: 0 };

  } catch (error) {
    console.error(error);
  }
};

export const getFormattedStats = async () => {
  const stats = await StatsModel.findById('global_stats').lean();
  const date = getTodayDate();

  if (!stats) return { 
    allTime: { get: 0, post: 0, total: 0 }, 
    today: { get: 0, post: 0, total: 0, date } 
  };

  const currentAllTimeGet = stats.allTime.get + buffer.get;
  const currentAllTimePost = stats.allTime.post + buffer.post;
  const currentTodayGet = (stats.today.date === date ? stats.today.get : 0) + buffer.get;
  const currentTodayPost = (stats.today.date === date ? stats.today.post : 0) + buffer.post;

  return {
    allTime: {
      get: currentAllTimeGet,
      post: currentAllTimePost,
      total: currentAllTimeGet + currentAllTimePost
    },
    today: {
      get: currentTodayGet,
      post: currentTodayPost,
      total: currentTodayGet + currentTodayPost,
      date: date
    }
  };
};
