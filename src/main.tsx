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
  forceInjectedProvider: false,
  openDeeplink(link: string) {
    const isInIframe = window !== window.parent;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // please ignore this bypasses to the window.ethereum object 
    // @ts-expect-error @metamask/sdk-react 
    const hasEthereum = typeof window.ethereum !== 'undefined';
    
    // please ignore this bypasses to the window.ethereum object
    // @ts-expect-error @metamask/sdk-react 
    const isMetaMaskInApp = hasEthereum && window.ethereum?.isMetaMask === true;
    
    // Check if we're in actual MetaMask app - not just with an injected provider
    const isActualMetaMaskApp = isMetaMaskInApp && /MetaMask/i.test(navigator.userAgent);

    // First check if we're in the actual MetaMask app
    if (isActualMetaMaskApp) {
      window.location.href = link;
      console.log(`deeplink attempted in actual MetaMask app: ${link}`);
    } 
    // Then handle iOS Safari in iframe case
    else if (isIOS && isInIframe) {
      console.log(`deeplink attempted in iframe+iOS Safari: ${link}`);
      window.parent.postMessage({ 
        type: 'OPEN_DEEPLINK', 
        link,
      }, '*');
    } 
    // Default fallback for all other cases
    else {
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
