import express from "express"
import { UserModel } from "../model/UserModel"
import { ResumeModel } from "../model/ResumeModel"

const resumeRoutes = express.Router()

// jwt middleware
const verificationMiddleware = require("../middleware/verification")

// SET STORAGE
const multer = require("multer")
const path = require("path")

const upload = multer({
  storage: multer.diskStorage({
    // set a localstorage destination
    destination: (req: any, file: any, cb: any) => {
      cb(null, `../../static`)
    },
    // convert a file name
    filename: (req: any, file: any, cb: any) => {
      cb(null, new Date().valueOf() + path.extname(file.originalname))
    },
  }),
})

/*
경력정보 작성을 위한 router
*/

// 유저의 경력정보 목록 조회: GET
resumeRoutes.get("/:user_id", async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params["user_id"]
    const resume = await ResumeModel.find({ user_id: userId })
    res.status(200).send(resume)
  } catch (err) {
    res.status(500).send(err)
  }
})

// 유저의 경력정보 추가: POST
// resumeRoutes.post("/", verificationMiddleware)
resumeRoutes.post("/", upload.single("resume_file"), async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findOne({ user_email: req.headers.email })
    if (user === null) {
      // 회원정보가 존재하지 않으면 오류반환
      res.status(403).send({ message: "존재하지 않는 아이디 입니다." })
    } else {
      const userId = user._id
      const resumeFile = req.file.filename
      const resumeName = req.body.resume_name
      const resumeDesc = req.body.resume_desc
      const resume = new ResumeModel({
        user_id: userId,
        resume_name: resumeName,
        resume_desc: resumeDesc,
        resume_file: resumeFile,
      })
      const newResume = await resume.save()
      res.status(200).json(newResume)
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// 유저의 경력정보 삭제: DELETE
resumeRoutes.delete("/", verificationMiddleware)
resumeRoutes.delete("/", async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserModel.findOne({ user_email: req.headers.email })
    if (user === null) {
      // 회원정보가 존재하지 않으면 오류반환
      res.status(403).send({ message: "존재하지 않는 아이디 입니다." })
    } else {
      // 회원정보가 존재하면 삭제
      const resume = await ResumeModel.findOneAndRemove({ _id: req.headers.resume_id })
      if (resume === null) {
        res.status(403).send({ message: "없는 경력 정보입니다." })
      } else {
        res.status(200).send({ message: "경력 정보가 삭제 되었습니다." })
      }
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

export { resumeRoutes }
