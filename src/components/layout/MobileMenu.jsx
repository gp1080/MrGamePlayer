import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MobileMenu = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    />
                    
                    {/* Menu */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween' }}
                        className="fixed right-0 top-0 h-full w-64 bg-gray-900 z-50 shadow-lg"
                    >
                        <div className="flex flex-col h-full">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="p-4 text-gray-400 hover:text-white self-end"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            {/* Menu items */}
                            <nav className="px-4 py-2">
                                <MenuItem to="/" onClick={onClose}>
                                    Home
                                </MenuItem>
                                <MenuItem to="/dashboard" onClick={onClose}>
                                    Dashboard
                                </MenuItem>
                                <MenuItem to="/play" onClick={onClose}>
                                    Play
                                </MenuItem>
                                <MenuItem to="/shop" onClick={onClose}>
                                    Shop
                                </MenuItem>
                                <MenuItem to="/profile" onClick={onClose}>
                                    Profile
                                </MenuItem>
                            </nav>

                            {/* Bottom section */}
                            <div className="mt-auto p-4 border-t border-gray-800">
                                <div className="mb-4">
                                    <WalletConnect />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MenuItem = ({ to, onClick, children }) => (
    <Link
        to={to}
        onClick={onClick}
        className="block py-3 text-gray-400 hover:text-white transition-colors duration-200"
    >
        {children}
    </Link>
);

export default MobileMenu; 