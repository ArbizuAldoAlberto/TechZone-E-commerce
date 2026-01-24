import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status
 * @returns {{ isConnected: boolean, isInternetReachable: boolean | null }}
 */
export const useConnection = () => {
    const [connectionStatus, setConnectionStatus] = useState({
        isConnected: true,
        isInternetReachable: true,
    });

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setConnectionStatus({
                isConnected: state.isConnected ?? true,
                isInternetReachable: state.isInternetReachable ?? true,
            });
        });

        // Get initial state
        NetInfo.fetch().then((state) => {
            setConnectionStatus({
                isConnected: state.isConnected ?? true,
                isInternetReachable: state.isInternetReachable ?? true,
            });
        });

        return () => unsubscribe();
    }, []);

    return connectionStatus;
};

export default useConnection;
