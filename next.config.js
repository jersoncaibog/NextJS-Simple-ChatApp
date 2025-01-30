/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        // SVG Configuration
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        })

        return config
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/a/**',
            },
        ],
    },
}

module.exports = nextConfig 