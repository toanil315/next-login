// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
    if(req.body.email === 'admin@example.com') {
        res.status(200).json({ authToken: '123' })
    }
    else {
        res.status(401).json({error: 'Email or password is invalid'})
    }
  }
  