import React from 'react';
import { useState } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners"


const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate()
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);



    const handleSendOtp = async () => {
        setLoading(true)

        try {
            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, {
                email
            }, { withCredentials: true })
            setErr("")
            setLoading(false)
            console.log(result)

            setStep(2)
        } catch (error) {
            console.log(error)
            setErr(error.response.data.message)
            setLoading(false)

        }
    }


    const handleVerifyOtp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, {
                email, otp
            }, { withCredentials: true })
            console.log(result)
            setErr("")
            setLoading(false)

            setStep(3)
        } catch (error) {
            console.log(error)
            setErr(error.response.data.message)
            setLoading(false)

        }
    }

    const handleResetPassword = async () => {
        if (newPassword != confirmPassword) {
            return null;
        }
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, {
                email, newPassword
            }, { withCredentials: true })
            setErr("")
            setLoading(false)

            console.log(result)
            navigate("/signin")
        } catch (error) {
            console.log(error)
            setErr(error.response.data.message)
            setLoading(false)

        }
    }


    return (
        <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">

                {/* header  */}

                <div className='flex mb-4 items-center gap-4'>
                    <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate("/signin")} />
                    <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Forgot Password</h1>
                </div>

                {/* step-1 */}

                {step == 1
                    &&
                    <div>
                        {/* email */}

                        <div className="mb-6 mt-6">
                            <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                            <input
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none '
                                placeholder='Enter your Email'
                            />
                        </div>

                        {/* error */}

                        {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>
                        }

                        {/* button */}

                        <button
                        disabled={loading}
                            onClick={() => handleSendOtp()}
                            className={`w-full font-semibold py-2 rounded-lg px- translate duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]`} >{loading? <ClipLoader size="20" color='white'/> :"Send Otp"}</button>

                    </div>
                }

                {/* step-2 */}

                {step == 2
                    &&
                    <div>
                        {/* otp */}

                        <div className="mb-6 mt-6">
                            <label htmlFor="otp" className='block text-gray-700 font-medium mb-1'>OTP</label>
                            <input
                                required
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                type="email"
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none '
                                placeholder='Enter OTP'
                            />
                        </div>

                        {/* error */}

                        {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>
                        }

                        {/* button */}

                        <button
                        disabled={loading}
                            onClick={() => handleVerifyOtp()}
                            className={`w-full font-semibold py-2 rounded-lg px- translate duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]`} >{loading? <ClipLoader size="20" color='white'/> :"Verify"}</button>

                    </div>
                }

                {/* step-2 */}

                {step == 3
                    &&
                    <div>
                        {/* new password */}

                        <div className="mb-6 mt-6">
                            <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1'>New Password</label>
                            <input
                                required
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                                type="text"
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none '
                                placeholder='Enter New Password'
                            />
                        </div>

                        {/* confirm password */}

                        <div className="mb-6 mt-6">
                            <label htmlFor="confirmPassword" className='block text-gray-700 font-medium mb-1'>Confirm Password</label>
                            <input
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                type="text"
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none '
                                placeholder='Enter Confirm Password'
                            />
                        </div>

                        {/* error */}

                        {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>
                        }

                        {/* button */}

                        <button
                        disabled={loading}
                            onClick={() => handleResetPassword()}
                            className={`w-full font-semibold py-2 rounded-lg px- translate duration-200 cursor-pointer bg-[#ff4d2d] text-white hover:bg-[#e64323]`} >{loading? <ClipLoader size="20" color='white'/> :"Reset Password"}</button>

                    </div>
                }

            </div>
        </div>
    );
}

export default ForgotPassword;
