import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-border mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            Copyright © Neuralitix. All rights reserved
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">
              Terms of Use
            </Link>
            <span className="text-muted-foreground">|</span>
            <a 
              href="mailto:hi@neuralitix.com"
              className="text-muted-foreground hover:text-foreground"
            >
              Contact us: hi@neuralitix.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}