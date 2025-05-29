import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'antd';

type AlertType = 'success' | 'info' | 'warning' | 'error';

interface AlertContextProps {
    showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error("useAlert must be used within AlertProvider");
    return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<AlertType>('info');

    const showAlert = (msg: string, alertType: AlertType = 'info') => {
        setMessage(msg);
        setType(alertType);
        setVisible(true);
        setTimeout(() => setVisible(false), 4000);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {visible && (
                <div
                    style={{
                        position: 'fixed',
                        top: '5%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        minWidth: '300px',
                    }}
                >
                    <Alert
                        message={message}
                        type={type}
                        showIcon
                        style={{
                            backgroundColor:
                                type === 'success' ? '#e6fffb' :
                                    type === 'error' ? '#fff1f0' :
                                        type === 'warning' ? '#fffbe6' :
                                            '#f0f5ff', // info
                            borderColor:
                                type === 'success' ? '#87e8de' :
                                    type === 'error' ? '#ffa39e' :
                                        type === 'warning' ? '#ffe58f' :
                                            '#adc6ff',
                            color:
                                type === 'success' ? '#08979c' :
                                    type === 'error' ? '#cf1322' :
                                        type === 'warning' ? '#d48806' :
                                            '#2f54eb',
                        }}
                    />
                </div>
            )}
            {children}
        </AlertContext.Provider>
    );
};
