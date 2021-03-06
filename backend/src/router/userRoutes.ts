import express from "express"
import { UserModel } from "../model/UserModel"
import { ArticleModel } from "../model/ArticleModel"
import { CandidateModel } from "../model/CandidateModel"

const userRoutes = express.Router()

// jwt middleware
const verificationMiddleware = require("../middleware/verification")

/*
본인의 정보를 요청하거나 정보를 수정하는 작업을 위한 router
*/

// 본인 회원정보 조회
userRoutes.get("/my", verificationMiddleware)
userRoutes.get("/my", async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findOne({ user_email: req.headers.email }).populate("user_resume")
    if (user === null) {
      // 회원정보가 존재하지 않으면 오류반환
      res.status(403).send({ message: "존재하지 않는 아이디 입니다." })
    } else {
      // 회원정보가 존재하면 수정
      res.status(200).send(user)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// 본인이 작성한 article 조회
userRoutes.get("/my/articles", verificationMiddleware)
userRoutes.get("/my/articles", async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findOne({ user_email: req.headers.email })
    if (user === null) {
      // 회원정보가 존재하지 않으면 오류반환
      res.status(403).send({ message: "존재하지 않는 아이디 입니다." })
    } else {
      // 회원정보가 존재하면 수정
      const articles = await ArticleModel.find({ user_id: user._id })
      if (articles === null) {
        res.status(403).send({ message: "작성한 글이 없습니다." })
      } else {
        res.status(200).send(articles)
      }
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// 본인이 신청한 candidate 조회
userRoutes.get("/my/candidates", verificationMiddleware)
userRoutes.get("/my/candidates", async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findOne({ user_email: req.headers.email })
    if (user === null) {
      // 회원정보가 존재하지 않으면 오류반환
      res.status(403).send({ message: "존재하지 않는 아이디 입니다." })
    } else {
      // 회원정보가 존재하면 수정
      const candidates = await CandidateModel.find({ user_id: user._id }).populate("article_id")
      if (candidates === null) {
        res.status(403).send({ message: "신청한 통역이 없습니다." })
      } else {
        res.status(200).send(candidates)
      }
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

/*
회원의 정보를 요청하거나 정보를 수정하는 작업을 위한 router
*/

// 전체 User 조회: GET
userRoutes.get("/", async (req: express.Request, res: express.Response) => {
  try {
    // 해당 Model에서 users 가져오기
    let users: any = await UserModel.find({})
    res.status(200).send(users)
  } catch (err) {
    res.status(500).send(err)
  }
})

// User 1개 조회: GET
userRoutes.get("/:user_id", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const user = await UserModel.findOne({ _id: userId }).populate("user_resume")
    if (user === null) {
      res.status(403).send({ message: "존재하지 않는 유저 입니다." })
    } else {
      res.status(200).send(user)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// User 통역가 신청 (id는 hash값): PUT
userRoutes.put("/:user_id", verificationMiddleware)
userRoutes.put("/:user_id", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const requestBody = req.body
    const article = UserModel.findOne({ _id: userId })
    if (article === null) {
      res.status(403).send({ message: "존재하지 않는 유저 입니다." })
    } else {
      await UserModel.findOneAndUpdate(
        { _id: userId },
        {
          user_is_ts: true,
          user_name: requestBody.user_name,
          user_gender: requestBody.user_gender,
          user_good_lang: requestBody.user_good_lang,
          user_intro: requestBody.user_intro,
        }
      )
      res.status(200).send({ message: `${userId} User가 통역가로 등록되었습니다.` })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// User가 작성한 article 조회: GET
userRoutes.get("/:user_id/articles", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const articles = await ArticleModel.find({ user_id: userId })
    if (articles === null) {
      res.status(403).send({ message: "작성한 글이 없습니다." })
    } else {
      res.status(200).send(articles)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// User가 신청한 candidate 조회: GET
userRoutes.get("/:user_id/candidates", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const candidates = await CandidateModel.find({ user_id: userId }).populate("article_id")
    if (candidates === null) {
      res.status(403).send({ message: "신청한 통역이 없습니다." })
    } else {
      res.status(200).send(candidates)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

export { userRoutes }
