// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
    console.log("request accessToken: ", req.headers.authorization)
    const accessToken = req.headers.authorization
    if(accessToken === 'Bearer 123') {
        res.status(200).json({ email: 'admin@example.com' })
	} else if (!req.headers.authToken) {
		res.status(401).json({ error: 'Authentication required' })
	} else {
		res.status(403).json({ error: 'Not permitted' })
    }
}
  