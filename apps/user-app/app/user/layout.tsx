const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-screen">
    <div className="w-[5vw] border bg-amber-300 br-gray-400 h-screen fixed left-0">

    </div>
      {children}
    </div>
  )
}

export default UserLayout