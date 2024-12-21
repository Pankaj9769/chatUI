import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import { MyContext } from "@/Context";
import { useDispatch, useSelector } from "react-redux";
import { putUser } from "@/utils/receiverSlice";
import { CiMenuKebab } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
function Userlist({ setChatRoom, friends, socket }) {
  // const user = useSelector((state) => state.receiver);
  const [option, setOption] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className=" w-64 border-r border-border bg-background">
      <div className="p-4 font-semibold flex flex-row justify-between items-center">
        {/* <div className=""> */}
        <span>Contacts</span>
        <div className="">
          <a
            className="hover:text-primary cursor-pointer"
            onClick={() => {
              setOption((prev) => !prev);
            }}
          >
            <CiMenuKebab />
          </a>
          <div className="absolute w-[11rem]">
            <div
              className={`${
                option ? "relative" : "hidden"
              } top-2 -left-40 bg-purple-50 py-3 z-10 shadow-md shadow-purple-300`}
            >
              <ul>
                <li className="">
                  <a
                    className="hover:text-purple-600 cursor-default px-1 py-2 font-"
                    onClick={goToProfile}
                  >
                    Account
                  </a>
                  {/* <a className="">Logout</a> */}
                </li>
                <li>
                  <a
                    className="hover:text-purple-600 cursor-default px-1 py-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </a>
                  {/* <a className="">Logout</a> */}
                </li>
                {/* <a className="">Logout</a> */}
              </ul>
            </div>
          </div>
        </div>

        {/* </div> */}
      </div>
      <ScrollArea className="h-[calc(100vh-60px)]">
        {friends &&
          friends.map((user) => (
            <button
              key={user._id}
              className="flex items-center justify-between w-full px-4 py-2 hover:bg-purple-50"
              onClick={() => {
                socket.emit("joinRoom", {
                  sender: JSON.parse(localStorage.getItem("user"))._id,
                  receiver: user._id,
                });
                // setNotify((prev) => prev.filter((ch) => ch !== user._id));
                // dispatch(receiverAction);
                dispatch(putUser(user));
                setChatRoom(user);
              }}
            >
              <div className="flex flex-row items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
              {/* {notify.includes(user._id) && (
                <span className="inline-block bg-primary tracking-wide subpixel-antialiased text-xs px-1 text-white rounded-full ">
                  new
                </span>
              )} */}
            </button>
          ))}
        <Toaster />
      </ScrollArea>
    </div>
  );
}

export default Userlist;
