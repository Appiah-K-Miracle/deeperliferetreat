import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#133358] px-4">
      <div className="text-center flex flex-col items-center gap-6">
        <div className="text-6xl">
<Image
  src="/deeperlifelogo.png"
  alt="Soul Winners Retreat Logo"
  width={200}
  height={200}
  className="mx-auto mb-4"
/>
        </div>
        <p className="font-medium text-white ">Theme:</p>
        <h1 className="text-3xl font-bold text-white">The Glory of Christ's Resurrection</h1>
        <p className="text-blue-200 text-md max-w-sm">
          Register for the retreat quickly and easily — no queues.
        </p>
        <Link
          href="/register"
          className="bg-white text-[#164C86] font-semibold text-lg px-8 py-4 rounded-xl hover:bg-blue-50"
        >
          Register Now →
        </Link>
      </div>
    </div>
  );
}
