import DojoLogo from "../assets/DojoByExample_logo.svg";
import DojoRedLogo from "../assets/Dojo-Logo-Stylized-Red.svg";
import StarknetLogo from "../assets/SN-Linear-Gradient.svg";

export function Header() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-12">
        {/* Dojo Engine Logo */}
        <div className="w-32 h-32 flex items-center justify-center p-2 hover:scale-105 transition-transform duration-300">
          <img
            src={DojoRedLogo}
            alt="Dojo"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>

        {/* Dojo By Example Logo*/}
        <div className="w-40 h-40 flex items-center justify-center hover:scale-105 transition-transform duration-500">
          <img
            src={DojoLogo}
            alt="Dojo By Example Logo"
            className="w-full h-full object-contain filter drop-shadow-2xl"
          />
        </div>

        {/* Starknet Logo */}
        <div className="w-40 h-40 flex items-center justify-center p-2 hover:scale-105 transition-transform duration-300">
          <img
            src={StarknetLogo}
            alt="Starknet"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>
      </div>

      <h1
        className="
          text-3xl md:text-5xl 
          font-bold mb-2 py-2
          bg-gradient-to-r from-red-500 via-white to-blue-600 
          bg-clip-text text-transparent 
          leading-normal
        "
      >
        Dojo Game Starter
      </h1>
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
        Complete onchain gaming template for{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400 font-semibold">
          Starknet
        </span>{" "}
        ecosystem
      </p>
    </div>
  );
}