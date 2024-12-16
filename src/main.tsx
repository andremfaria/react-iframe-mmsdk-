import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { MetaMaskProvider } from '@metamask/sdk-react'

const sdkOptions = {
  dappMetadata: {
    name: 'MetaMask SDK React Iframe example',
    url: window.location.protocol + '//' + window.location.host,
  },
  infuraAPIKey: import.meta.env.VITE_INFURA_PROJECT_ID ?? '',
  logging: {
    developerMode: false
  },
  forceInjectedProvider: true,
  openDeeplink(link: string) {
    const isInIframe = window !== window.parent;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isInIframe && isIOS) {
      console.log(`deeplink attempted in iframe+iOS: ${link}`);
      
      // Send both the deeplink request and ethereum status
      window.parent.postMessage({ 
        type: 'OPEN_DEEPLINK', 
        link,
      }, '*');
      
    } else {
      window.open(link, '_blank');
      console.log(`deeplink attempted in normal mode: ${link}`);
    }
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MetaMaskProvider debug={true} sdkOptions={sdkOptions}>
      <App />
    </MetaMaskProvider>
  </StrictMode>,
);
