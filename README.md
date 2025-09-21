# VenMorph - Cross-Chain Crypto Payments

> **Request, Transform, Receive.** Real-time Flare pricing • XRPL settlement in seconds

A modern, responsive web application for cross-chain cryptocurrency payments and requests. Built with XRPL integration, GemWallet support, and real-time price conversion featuring smooth glass-morphism design and seamless user experience.

## 🎥 **Live Demo Video**

**🎬 Watch VenMorph in Action:**

[![VenMorph Demo Video](https://img.shields.io/badge/▶️_WATCH_DEMO-Loom_Video-FF5722?style=for-the-badge&logo=loom)](https://www.loom.com/share/4e9a5df8899f4a54ad66193032628962?sid=f9e12f5e-0628-48ba-a014-91648a7ccd63)

**🔗 Direct Link:** https://www.loom.com/share/4e9a5df8899f4a54ad66193032628962?sid=f9e12f5e-0628-48ba-a014-91648a7ccd63

*See real-time Flare Oracle pricing, XRPL transactions, and GemWallet integration in action!*

---

## ✨ Screenshots & Demo

### 🏠 **Home Page - Main Interface**
<div align="center">
  <img src="./screenshots/venMorph.%20Home%20page.png" alt="VenMorph Home Page - Request, Transform, Receive" width="800"/>
  <p><em>Clean, modern interface featuring the "Request, Transform, Receive" hero section with glass-morphism design and navigation</em></p>
</div>

### � **Home Page - Call-to-Action Section**
<div align="center">
  <img src="./screenshots/venMorph.%20Bottom%20Home.png" alt="VenMorph Home Page Bottom Section" width="800"/>
  <p><em>"Ready to Transform Payments?" call-to-action section with PAY/REQUEST button and feature highlights</em></p>
</div>

### 📝 **Request Payment Interface**
<div align="center">
  <img src="./screenshots/venMorph.%20Request%20Payment.png" alt="VenMorph Request Payment Creation" width="800"/>
  <p><em>Intuitive payment request form with asset selection, amount input, and real-time conversion via Flare Oracle integration</em></p>
</div>

### � **Send Payment Interface**
<div align="center">
  <img src="./screenshots/venMorph.%20Send%20Payment.png" alt="VenMorph Send Payment Interface" width="800"/>
  <p><em>Streamlined payment interface with live conversion rates, recipient input, and message functionality powered by XRPL</em></p>
</div>

### � **Pending Requests Management**
<div align="center">
  <img src="./screenshots/venMorph.%20Pending%20Requests.png" alt="VenMorph Pending Requests Management" width="800"/>
  <p><em>Clean request management interface showing incoming payment requests with Accept/Decline action buttons</em></p>
</div>

### ✅ **Payment Verification on XRP Ledger**
<div align="center">
  <img src="./screenshots/Payment%20Verfication%20on%20XRP%20Ledger.png" alt="XRPL Payment Verification and Explorer" width="800"/>
  <p><em>Real transaction verification on XRPL Testnet Explorer showing successful payment with transaction hash, amount, and ledger details</em></p>
</div>

### 🔧 **Technology Stack Overview**
<div align="center">
  <img src="./screenshots/Tech%20Stack%20Image.jpeg" alt="VenMorph Technology Stack" width="800"/>
  <p><em>Complete technology stack showcasing XRPL integration, Flare Oracle, GemWallet API, and modern web technologies</em></p>
</div>

---

## 🚀 Key Features

### 💰 **Payment System**
- **XRPL Integration**: Native XRP payments with testnet support for development
- **GemWallet Support**: Browser extension wallet integration with automatic testnet switching
- **Account Validation**: Smart account verification and automatic funding for testnet accounts
- **Real-time Conversion**: Live XRP to USDT pricing via Flare Oracle integration

### 🔄 **Cross-Chain Capabilities**
- **Multi-Asset Requests**: Request payments in ETH, XRP, and other supported cryptocurrencies
- **Automatic Conversion**: Seamless asset transformation using real-time pricing
- **Universal Recipients**: Support for ENS names, wallet addresses, and custom identifiers

### 🎨 **User Experience**
- **Glass-Morphism Design**: Modern, translucent UI with smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live conversion rates and transaction status updates
- **Intuitive Navigation**: Clean three-page layout (Home → Request → Pay)

### 🔐 **Security & Reliability**
- **Testnet Environment**: Safe testing with no real monetary value at risk
- **Transaction Attestation**: Automatic verification and tracking of all payments
- **Account Protection**: Smart validation prevents failed transactions
- **Explorer Integration**: Direct links to XRPL explorer for transaction verification

## 📁 Project Architecture

```
xrpl-venmo-mvp/
├── 🎯 Frontend
│   ├── index.html              # Main application interface
│   ├── base.css               # Core styling and CSS variables
│   ├── components.css         # UI components (buttons, cards, modals)
│   ├── pages.css              # Page-specific layouts and styles  
│   ├── animations.css         # Keyframe animations and transitions
│   ├── responsive.css         # Mobile and tablet breakpoints
│   ├── main.js                # Application initialization
│   ├── navigation.js          # Page routing and navigation
│   ├── wallet.js              # XRPL wallet integration & demo accounts
│   ├── forms.js               # Payment processing & GemWallet integration
│   └── animations.js          # Scroll effects and UI animations
│
├── 🔧 Backend
│   ├── index.js               # Express server with XRPL integration
│   ├── fdc.js                 # Flare Data Connector configuration
│   ├── ftsov2_consumer.js     # FTSO v2 price oracle consumer
│   ├── pay.js                 # Payment processing utilities
│   ├── package.json           # Node.js dependencies
│   └── .env                   # Environment configuration
│
└── 📸 Documentation
    ├── README.md              # This documentation
    └── screenshots/           # Application screenshots
```

### 🏗️ **Technology Stack**
- **Frontend**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express.js, XRPL.js v2.7.0
- **Blockchain**: XRPL Testnet, GemWallet API v3.8.0
- **Pricing**: Flare FTSO v2 Oracle for real-time conversion
- **Design**: Glass-morphism, CSS Grid, Flexbox

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** (v16+ recommended)
- **GemWallet** browser extension (for wallet integration)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EvanL888/venMorph8.git
   cd xrpl-venmo-mvp
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**:
   ```bash
   node index.js
   ```
   You should see:
   ```
   ✅ Connected to XRPL Testnet
   📡 Subscribed to XRPL transactions  
   🚀 Backend running on http://localhost:4000
   ```

4. **Access the application**:
   - Open your browser and go to: `http://localhost:4000`
   - The frontend will be served automatically by the Express server

### 💡 **Development Tips**
- **Testnet Environment**: All transactions use XRPL testnet (no real money)
- **Auto-funding**: Accounts automatically receive test XRP when needed
- **GemWallet Setup**: Install GemWallet extension and switch to testnet
- **Hot Reload**: Restart server after backend changes

## 📱 How to Use VenMorph

### 🏠 **Home Page - "Request, Transform, Receive"**
- **Welcome Interface**: Clean hero section introducing VenMorph's core functionality
- **Navigation**: Access Request and Pay pages via the top navigation bar
- **Wallet Connection**: Connect your XRPL wallet or use demo accounts for testing

### 📝 **Request Payment**
1. **Create Request**: Fill out the request form with:
   - **Asset**: Choose from ETH, XRP, or other supported cryptocurrencies
   - **Amount**: Specify the amount you want to request
   - **Recipient**: Enter wallet address or ENS name
   - **Message**: Add a personal note (optional)
   - **Expiry & Slippage**: Set request parameters

2. **Live Conversion**: See real-time conversion rates via Flare Oracle
3. **Generate Request**: Create shareable payment requests with QR codes

### 💸 **Send Payment**
1. **Choose Payment Method**:
   - **Built-in XRPL**: Use demo accounts for testing
   - **GemWallet (Testnet)**: Connect your GemWallet browser extension

2. **Payment Processing**:
   - **Account Validation**: Automatic verification and funding of testnet accounts
   - **Smart Conversion**: XRP to USDT conversion for specific payments
   - **Transaction Tracking**: Real-time status updates and explorer links

3. **Confirmation**: View transaction details and XRPL explorer verification

### 📋 **Manage Requests**
- **Pending Requests**: View incoming payment requests
- **Accept/Decline**: Quick actions for request management
- **Transaction History**: Track completed payments with attestation

### 🔧 **Advanced Features**
- **Testnet Safety**: All transactions use test XRP (no real monetary value)
- **Automatic Funding**: System provides test XRP when accounts need funding
- **Real-time Pricing**: Live conversion rates updated via Flare Oracle
- **Transaction Attestation**: Automatic verification and tracking system

## 🎨 Customization

### Styling
- **Color Scheme**: Primary brand color is `#c1e328` (lime green)
- **Fonts**: Uses system fonts for optimal performance
- **Responsive**: Breakpoints at 768px and 480px

### Adding New Features
1. **CSS**: Add styles to appropriate CSS file in `/css/` directory
2. **JavaScript**: Create new module in `/js/` directory and import in `index.html`
3. **HTML**: Add new sections to `index.html` with proper class names

### Configuration
Edit the following files for customization:
- `js/forms.js`: Update conversion rates and supported cryptocurrencies
- `css/base.css`: Modify color scheme and typography
- `css/responsive.css`: Adjust mobile breakpoints and layouts

## 🔧 Technical Implementation

### 🌐 **XRPL Integration**
- **Testnet Connection**: `wss://s.altnet.rippletest.net:51233`
- **Account Management**: Automatic validation and funding via testnet faucet
- **Transaction Processing**: Real-time payment processing with 1-3 second settlement
- **Explorer Integration**: Direct links to XRPL testnet explorer for verification

### 💳 **GemWallet Integration**
- **Browser Extension**: Seamless integration with GemWallet API v3.8.0
- **Testnet Configuration**: Automatic network switching to XRPL testnet
- **Payment Requests**: Structured payment requests with memo support
- **Error Handling**: Comprehensive validation and user-friendly error messages

### 📊 **Flare Oracle Integration**
- **FTSO v2**: Real-time price feeds from Flare Time Series Oracle
- **Live Conversion**: XRP to USDT/USD conversion rates
- **Price Updates**: Automatic refresh of conversion rates
- **Oracle Reliability**: Decentralized price data for accurate conversions

### 🎨 **Frontend Architecture**
- **Modular CSS**: Separated concerns (base, components, pages, animations)
- **Glass-morphism**: Modern translucent design with backdrop filters
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Performance**: Optimized animations with hardware acceleration

### 🔐 **Security Features**
- **Testnet Environment**: No real money at risk during development/testing
- **Input Validation**: Comprehensive client and server-side validation
- **Transaction Verification**: Automatic attestation and tracking system
- **Error Recovery**: Smart handling of failed transactions and network issues

## 🚀 Deployment & Production

### 🏗️ **Local Development**
```bash
# Start development server
cd backend
node index.js

# Server runs at http://localhost:4000
# Frontend automatically served by Express
```

### ☁️ **Production Deployment**

**Backend Requirements:**
- Node.js runtime environment
- Environment variables for XRPL configuration
- SSL certificate for HTTPS (required for GemWallet)

**Recommended Platforms:**
1. **Railway/Render**: Easy Node.js deployment
2. **Heroku**: Traditional PaaS with Node.js support  
3. **AWS/Google Cloud**: Full control with container deployment
4. **Vercel**: Serverless functions for API endpoints

**Environment Setup:**
```bash
# Required environment variables
XRPL_SERVER=wss://s.altnet.rippletest.net:51233  # Testnet
PORT=4000
NODE_ENV=production
```

### 🔒 **Production Considerations**
- **HTTPS Required**: GemWallet requires secure connections
- **CORS Configuration**: Proper origin handling for production domains
- **Rate Limiting**: Implement request throttling for API endpoints
- **Monitoring**: Add logging and error tracking (e.g., Sentry)
- **Backup**: Regular backup of transaction attestation data

## 🛡️ Security & Best Practices

### � **Security Measures**
- **Testnet Only**: Current implementation uses XRPL testnet for safety
- **Input Sanitization**: All user inputs validated and sanitized
- **No Private Keys**: Application never handles or stores private keys
- **Transaction Verification**: All payments verified via XRPL explorer
- **Error Handling**: Comprehensive error catching and user feedback

### ⚡ **Performance Optimizations**
- **Debounced API Calls**: Prevent excessive oracle price requests
- **Caching**: Strategic caching of conversion rates and account data
- **Lazy Loading**: Components loaded as needed
- **Hardware Acceleration**: GPU-accelerated CSS animations
- **Minification**: Compressed assets for production deployment

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🔧 **Development Workflow**
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/venMorph8.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `cd backend && npm install`
5. **Test** your changes thoroughly
6. **Commit** with clear messages: `git commit -m "Add amazing feature"`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Submit** a Pull Request with detailed description

### 📋 **Contribution Guidelines**
- Follow existing code style and conventions
- Test on multiple browsers and screen sizes
- Update documentation for any new features
- Ensure all payments work correctly on testnet
- Add screenshots for UI changes

### 🐛 **Bug Reports**
- Use GitHub Issues with detailed reproduction steps
- Include browser version, OS, and GemWallet version
- Provide transaction hashes for payment-related issues
- Screenshots help with UI/UX problems

## � Project Status

### ✅ **Completed Features**
- ✅ XRPL testnet integration with payment processing
- ✅ GemWallet browser extension support
- ✅ Real-time price conversion via Flare Oracle
- ✅ Account validation and automatic funding
- ✅ Transaction attestation and verification
- ✅ Glass-morphism UI with responsive design
- ✅ Cross-chain payment request system

### 🚧 **In Development**
- 🔄 Mainnet deployment preparation
- 🔄 Additional wallet integrations (MetaMask, WalletConnect)
- 🔄 Enhanced transaction history and analytics
- 🔄 Multi-language support

### 🎯 **Future Roadmap**
- 🚀 Support for additional blockchains (Ethereum, Polygon)
- 🚀 Advanced payment scheduling and recurring payments
- 🚀 Integration with more DeFi protocols
- 🚀 Mobile app development

## 📞 Support & Contact

### 🆘 **Getting Help**
- **GitHub Issues**: [Report bugs or request features](https://github.com/EvanL888/venMorph8/issues)
- **Documentation**: Check this README and inline code comments
- **XRPL Community**: [XRPL Developer Discord](https://discord.gg/427qqMYwHh)
- **GemWallet Support**: [GemWallet Documentation](https://gemwallet.app/)

### 🔗 **Useful Links**
- **Live Demo**: `http://localhost:4000` (after setup)
- **XRPL Testnet Explorer**: [https://testnet.xrpl.org](https://testnet.xrpl.org)
- **Flare Oracle Docs**: [FTSO Documentation](https://docs.flare.network/ftso/)
- **GemWallet**: [Browser Extension](https://gemwallet.app/)

### 💬 **Community**
Join the conversation and stay updated:
- **GitHub**: [VenMorph8 Repository](https://github.com/EvanL888/venMorph8)
- **XRPL**: Built on the XRP Ledger ecosystem
- **Flare Network**: Powered by Flare Oracle pricing

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License - Feel free to use, modify, and distribute
with attribution to the original authors.
```

---

<div align="center">

### 🌟 **Built with ❤️ for the Future of Cross-Chain Payments**

**VenMorph** • *Request, Transform, Receive*

[![XRPL](https://img.shields.io/badge/Built%20on-XRPL-blue)](https://xrpl.org)
[![Flare](https://img.shields.io/badge/Powered%20by-Flare%20Oracle-orange)](https://flare.network)
[![GemWallet](https://img.shields.io/badge/Integrated-GemWallet-green)](https://gemwallet.app)
[![Testnet](https://img.shields.io/badge/Environment-Testnet-yellow)](https://testnet.xrpl.org)

*Making cross-chain crypto payments as easy as sending a text message*

</div>