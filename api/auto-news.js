const {getNews}=require('../lib/news-store');
module.exports=(req,res)=>{res.setHeader('Cache-Control','public, max-age=60, s-maxage=300');res.status(200).json(getNews())};
