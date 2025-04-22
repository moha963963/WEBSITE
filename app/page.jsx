import { Button } from "@/components/ui/button";
import Link from "next/link";

const LOGIN_BUTTON_TEXT = "Login";
const REGISTER_BUTTON_TEXT = "Register";

export default function Home() {
  return (
    <div className="flex items-center justify-center gap-4 h-screen bg-neutral-50">
      <Link href="/login">
        <Button
          className="px-8 py-3 text-white bg-blue-600 rounded-lg 
                     hover:bg-blue-700 transition-colors shadow-sm
                     hover:shadow-md font-medium"
        >
          {LOGIN_BUTTON_TEXT}
        </Button>
      </Link>
      <Link href="/register">
        <Button
          className="px-8 py-3 text-blue-600 bg-white rounded-lg
                   border border-blue-200 hover:border-blue-300
                   transition-colors shadow-sm hover:shadow-md
                   font-medium hover:bg-blue-50"
        >
          {REGISTER_BUTTON_TEXT}
        </Button>
      </Link>
    </div>
  );
}
