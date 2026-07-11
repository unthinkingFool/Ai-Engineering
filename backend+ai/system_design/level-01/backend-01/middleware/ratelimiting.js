import {redis} from "../index.js"

const ratelimitter = async (req, res ,next)=>{
    const ip=req.ip;
    const key=`rate_limit : ${ip}`;
    const request=await redis.incr(key)

    // expire after 60s 
    if(request==1){
        await redis.expire(key,60)
    }

    // simultaneous 5 req will block the ip
    if(request>5){
        return res.status(429).json({
            message: " too many requests "
        })
    }

    next()
}

export default ratelimitter;