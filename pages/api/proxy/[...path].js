import httpProxy from "http-proxy";
import Cookies from "cookies";
import url from 'url'

//Get the actual API_URL in environment  variable
const API_URL = process.env.API_URL

const proxy = httpProxy.createProxyServer()

// You can export a config variable from any API route in Next.js.
// We'll use this to disable the bodyParser, otherwise Next.js
// would read and parse the entire request body before we
// can forward the request to the API. By skipping the bodyParser,
// we can just stream all requests through to the actual API.
export const config = {
    api: {
        bodyParser: false
    }
}

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
		const pathname = url.parse(req.url).pathname
		const isLogin = pathname === '/api/proxy/login'

		const cookies = new Cookies(req, res)
		const authToken = cookies.get('auth-token')

		// Rewrite URL, strip out leading '/api'
		// '/api/proxy/*' becomes '${API_URL}/*'
		req.url = req.url.replace(/^\/api\/proxy/, '')

		// Don't forward cookies to API
		req.headers.cookie = ''

		// Set auth-token header from cookie
		if (authToken) {
			req.headers.authorization = 'Bearer ' + authToken
		}

		proxy
			.once('proxyRes', (proxyRes, req, res) => {
				if (isLogin) {
					let responseBody = ''
					proxyRes.on('data', (chunk) => {
						responseBody += chunk
					})

					proxyRes.on('end', () => {
						try {
							const { authToken } = JSON.parse(responseBody)
							const cookies = new Cookies(req, res)
							cookies.set('auth-token', authToken, {
								httpOnly: true,
								sameSite: 'lax', // CSRF protection
							})

							res.status(200).json({ loggedIn: true })
							resolve()
						} catch (err) {
							reject(err)
						}
					})
				} else {
					resolve()
				}
			})
			.once('error', reject)
			.web(req, res, {
				target: 'http://localhost:3000/api', //Endpoint actual API
				autoRewrite: false,
				selfHandleResponse: isLogin,
			})
	})
}

