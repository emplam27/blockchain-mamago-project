import express from "express"
import { UserModel } from "../model/UserModel"
import { StarRateModel } from "../model/StarRateModel"

const starRateRoutes = express.Router()

// jwt middleware
const verificationMiddleware = require("../middleware/verification")

/*
별점을 위한 router
*/

// 유저의 평가 목록 조회: GET
starRateRoutes.get("/:user_id", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const starRate = await StarRateModel.find({ star_rate_ts_user_id: userId })
    res.status(200).send(starRate)
  } catch (err) {
    res.status(500).send(err)
  }
})

// 유저의 별점 조회: GET
starRateRoutes.get("/:user_id/score", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const starRate = await StarRateModel.find({ star_rate_ts_user_id: userId })
    if (starRate === null) {
      res.status(200).send({ messege: "평가가 없습니다." })
    } else {
      let scoreSum: any = 0
      starRate.forEach((rate: any) => {
        scoreSum += rate.star_rate_score
      })
      res.status(200).send({ score: scoreSum / starRate.length })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// 유저 평가: POST
starRateRoutes.post("/", verificationMiddleware)
starRateRoutes.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findOne({ user_email: req.headers.email })
    const starRateRqUserId = user._id
    const starRateTsUserId = req.body.star_rate_ts_user_id
    const articleId = req.body.article_id
    const starRateScore = req.body.star_rate_score
    const starRateContent = req.body.star_rate_content
    const starRate = new StarRateModel({
      star_rate_ts_user_id: starRateTsUserId,
      star_rate_rq_user_id: starRateRqUserId,
      article_id: articleId,
      star_rate_score: starRateScore,
      star_rate_content: starRateContent,
    })
    const newStarRate = await starRate.save()
    res.status(200).json(newStarRate)
  } catch (err) {
    res.status(500).send(err)
  }
})

export { starRateRoutes }
