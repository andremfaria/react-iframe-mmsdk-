import { SDKProvider, useSDK } from '@metamask/sdk-react';
import { useState } from 'react';
import './App.css';
import { Buffer } from 'buffer';

const lineaChainId = '0xe708';

const changeNetwork = async ({provider, hexChainId}: {provider: SDKProvider, hexChainId: string}) => {
  console.debug(`switching to network chainId=${hexChainId}`);
  try {
    const response = await provider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
    });
    console.debug(`changeNetworkresponse`, response);
    return response;
  } catch (err) {
    if (err instanceof Object) {
      return JSON.stringify(err);
    }
    return err;
  }
};

function SwitchChainDialog({ onDismiss }: { onDismiss: () => void }) {
  const { provider } = useSDK();

  if (!provider) {
    return null;
  }

  return (
    <div className="switch-chain-dialog-overlay">
      <div className="switch-chain-dialog">
        <div className="switch-chain-dialog-content">
          This dapp uses Linea, do you want to change to Linea? (Chain ID: {lineaChainId})
        </div>
        <div className="switch-chain-dialog-buttons">
          <button 
            onClick={() => changeNetwork({provider, hexChainId: lineaChainId})
              .then(() => {
                onDismiss();
              })}
            className="switch-chain-button"
          >
            Yes
          </button>
          <button 
            onClick={onDismiss}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
export const App = () => {
 

  const [response, setResponse] = useState<unknown>('');
  const [showSwitchChainDialog, setShowSwitchChainDialog] = useState(false);
  const { sdk, connected, connecting, provider, chainId, account, balance } = useSDK();

  const connect = async () => {
    try {
      console.log("before connect")
      const accounts = await sdk?.connect();
      console.log("after connect")
      // const currentChainId = await provider?.getChainId();
      setResponse(accounts);

      // if (currentChainId && currentChainId !== lineaChainId) {
      //   console.log('would switch to ', lineaChainId);
      //   setShowSwitchChainDialog(true);
      // }
    } catch (err) {
      if (err instanceof Object) {
        setResponse(JSON.stringify(err));
        return;
      }
      setResponse(err);
      console.error(`failed to connect..`, err);
    }
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, 
      from: account,
      value: '0x5AF3107A4000', 
    };

    try {
      const txHash = (await provider?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })) as string;

      setResponse(txHash);
    } catch (e) {
      if (e instanceof Object) {
        setResponse(JSON.stringify(e));
        return;
      }
      setResponse(e);
      console.error(e);
    }
  };

  const terminate = async () => {
    await sdk?.terminate();
    setResponse('Terminated');
  };

  const handleSwitchChain = async () => {
    if (!provider) {
      console.error('Provider is not available');
      return;
    }
    changeNetwork({ provider, hexChainId: lineaChainId})
      .then((result) => {
        console.log('switch chain result', result);
        setShowSwitchChainDialog(false);
        if (result instanceof Object) {
          setResponse(JSON.stringify(result));
        } else {
          setResponse(result);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const testBatchConnectAndSwitch = async () => {
    const requests = [{
      method: "eth_requestAccounts", // This is a valid Ethereum RPC method to request account access
      params: []
  },
  {
      method: "wallet_switchEthereumChain", // This is a valid MetaMask-specific method to switch networks
      params: [{ chainId: "0x1" }] // chainId should be a hex string like "0x1" for mainnet
  }
  ]
    await sdk?.connectWith(requests[1])
  }


  const signMessageHandler = async () => {
    const message = 'Hello, world!'
    const hexMessage = "0x" + Buffer.from(message).toString('hex')
    console.log("hexMessage ends:", hexMessage)
    console.log("[signMessageHandler] before signing...")
    const signature = await sdk?.getProvider()?.request({
      method: "personal_sign",
      params: [hexMessage, account]
    })
    console.log("[signMessageHandler] after signing...")
    setResponse(signature)
  }

  return (
    <div className="App">
      <h1>Vite React MMSDK Example</h1>
      <div>
        <p>{`Connected: ${connected}`}</p>
        <p>{`Connected chain: ${chainId ?? ''}`}</p>
        <p>{`Connected account: ${account ?? ''}`}</p>
        <p>{`Account balance: ${balance ?? ''}`}</p>
        <p>{`Last request response: ${response ?? ''}`}</p>
        <p>{`Connected: ${connected ?? ''}`}</p>
        Normal Deeplink for testing:
        <a href="metamask://buy-crypto">Deeplink buy crypto</a>
      </div>

      {showSwitchChainDialog && (
        <SwitchChainDialog onDismiss={() => setShowSwitchChainDialog(false)} />
      )}

      <div>
        {connecting && (
          <div>Waiting for Metamask to link the connection...</div>
        )}
      </div>

      <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={testBatchConnectAndSwitch}>
            Test batch connect and switch
          </button>
          {connected && <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={signMessageHandler}>
            Sign message
          </button>}
      {connected ? (  
        <div className="Button-Container">
          <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={connect}>
            Request Accounts
          </button>

          <button
            style={{ padding: 10, margin: 10 }}
            onClick={sendTransaction}
          >
            Send transaction
          </button>

          <button
            style={{ padding: 10, margin: 10 }}
            onClick={handleSwitchChain}
          >
            Switch to Linea
          </button>

        </div>
      ) : (
        <div className="Button-Container">
          <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={connect}>
            Connect
          </button>
        </div>
      )}

      <button
        className={'Button-Danger'}
        style={{ padding: 10, margin: 10 }}
        onClick={terminate}
      >
        Terminate
      </button>
    </div>
  );
};

export default App;
