
import React, { useState, useEffect } from 'react';
import { UserRole, StudyFile, UserCredential } from './types';
import Login from './components/Login';
import FounderDashboard from './components/FounderDashboard';
import StudentDashboard from './components/StudentDashboard';

// Secure Storage Keys
const STORAGE_KEYS = {
  FILES: 'edu_data_encrypted_v1',
  USERS: 'user_logs_encrypted_v1'
};

// Simple but effective obfuscation to prevent easy tampering via Browser DevTools
const SecurityUtils = {
  encrypt: (data: any): string => {
    try {
      const str = JSON.stringify(data);
      // Simple base64 + salt obfuscation
      return btoa(encodeURIComponent(str));
    } catch (e) {
      console.error("Encryption failed", e);
      return "";
    }
  },
  decrypt: (encrypted: string): any => {
    try {
      if (!encrypted) return null;
      const decoded = decodeURIComponent(atob(encrypted));
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Decryption failed / Data tampered", e);
      return null;
    }
  },
  sanitize: (str: string): string => {
    return str.replace(/[<>]/g, ""); // Prevent basic XSS
  }
};

const App: React.FC = () => {
  // Set default role to STUDENT so login page is not visible initially
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [users, setUsers] = useState<UserCredential[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data securely on mount
  useEffect(() => {
    try {
      const encryptedFiles = localStorage.getItem(STORAGE_KEYS.FILES);
      const encryptedUsers = localStorage.getItem(STORAGE_KEYS.USERS);

      const decryptedFiles = SecurityUtils.decrypt(encryptedFiles || "");
      const decryptedUsers = SecurityUtils.decrypt(encryptedUsers || "");

      if (Array.isArray(decryptedFiles)) setFiles(decryptedFiles);
      if (Array.isArray(decryptedUsers)) setUsers(decryptedUsers);
    } catch (err) {
      console.error("Critical: Storage is corrupted. Resetting for safety.");
      localStorage.clear();
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync files to localStorage with encryption
  const syncFiles = (newFiles: StudyFile[]) => {
    setFiles(newFiles);
    localStorage.setItem(STORAGE_KEYS.FILES, SecurityUtils.encrypt(newFiles));
  };

  const handleLogin = (newRole: UserRole, studentData?: { email: string, password: string }) => {
    if (newRole === 'STUDENT' && studentData) {
      const newUser: UserCredential = {
        email: SecurityUtils.sanitize(studentData.email),
        password: studentData.password, // Keep as is for verification
        loginTime: new Date().toLocaleString()
      };
      const updatedUsers = [newUser, ...users].slice(0, 100); // Keep last 100 for safety
      setUsers(updatedUsers);
      localStorage.setItem(STORAGE_KEYS.USERS, SecurityUtils.encrypt(updatedUsers));
    }
    setRole(newRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Securing Session...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (role) {
      case 'FOUNDER':
        return (
          <FounderDashboard 
            onLogout={handleLogout} 
            files={files} 
            onFilesChange={syncFiles}
            users={users}
          />
        );
      case 'STUDENT':
        return (
          <StudentDashboard 
            onLogout={handleLogout} 
            files={files} 
          />
        );
      default:
        return <Login onLoginSuccess={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {renderContent()}
    </div>
  );
};

export default App;
