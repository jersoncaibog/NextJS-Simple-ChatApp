'use client'

interface HeaderProps {
  profilePicture?: string;
  userName: string;
  activeStatus: string;
}

export function Header({ profilePicture, userName, activeStatus }: HeaderProps) {
  const renderProfile = () => {
    if (profilePicture) {
      return <img src={profilePicture} alt="Profile" className="h-8 w-8 rounded-full mr-2" />;
    } else {
      const initials = userName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-2 ">
          <span>{initials}</span>
        </div>
      );
    }
  };

  return (
    <header className="border-b bg-white px-4 py-3">
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          {renderProfile()}
          <div className="flex flex-col  ">
            <h1 className="text-md font-medium text-gray-900">{userName}</h1>
            <span className="text-xs text-gray-500">{activeStatus}</span>
          </div>
        </div>
      </div>
    </header>
  )
} 