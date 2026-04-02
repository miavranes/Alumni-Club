import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

type ImageProps = {
  src: string;
  alt?: string;
};

type ButtonProps = {
  title?: string;
  variant?: "primary" | "secondary" | "link";
  size?: "sm" | "md" | "lg";
};

type Footer = {
  heading: string;
  description: string;
  button: ButtonProps;
};

type SocialLink = {
  href: string;
  icon: React.ReactNode;
};

type AlumniMember = {
  id: number;
  image: ImageProps;
  name: string;
  jobTitle: string;
  description: string;
  socialLinks: SocialLink[];
  isPublic: boolean;
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  alumniMembers: AlumniMember[];
  footer: Footer;
};

export type AlumniDirectoryProps = React.ComponentPropsWithoutRef<"section"> &
  Partial<Props>;

const Button: React.FC<
  ButtonProps & {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit";
  }
> = ({
  title,
  variant = "primary",
  size = "md",
  children,
  onClick,
  className = "",
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-[#ffab1f] text-white hover:bg-[#ff9500] focus:ring-[#ffab1f]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    link: "text-blue-600 hover:text-blue-700 underline",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children || title}
    </button>
  );
};

const AlumniMemberCard = ({ member }: { member: AlumniMember }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!member.isPublic) return;
    navigate(`/alumni/${member.id}`);
  };

  return (
    <div
      className="flex flex-col text-center cursor-pointer hover:scale-[1.02] transition"
      onClick={handleClick}
    >
      <div className="rb-5 mb-5 flex w-full items-center justify-center md:mb-6">
        <img
          src={member.image.src}
          alt={member.image.alt}
          className="size-20 min-h-20 min-w-20 rounded-full object-cover"
        />
      </div>
      <div className="mb-3 md:mb-4">
        <h5 className="text-md font-semibold md:text-lg text-white">{member.name}</h5>
        <h6 className="md:text-md text-white">{member.jobTitle}</h6>
      </div>
      {member.description && (
        <p className="text-white text-sm opacity-90 break-all">{member.description}</p>
      )}
      <div className="mt-6 grid grid-flow-col grid-cols-[max-content] gap-3.5 self-center">
        {member.socialLinks.map((link: SocialLink, index: number) => (
          <a key={index} href={link.href}>{link.icon}</a>
        ))}
      </div>
    </div>
  );
};

export const AlumniDirectory = (props: AlumniDirectoryProps) => {
  const { heading, description, footer } = {
    ...AlumniDirectoryDefaults,
    ...props,
  };

  const navigate = useNavigate();
  const [showPrivatePopup, setShowPrivatePopup] = useState(false);
  const [alumniMembers, setAlumniMembers] = useState<AlumniMember[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/alumni/directory");
        const backendUsers = res.data.users;
        const API_BASE_URL = import.meta.env.VITE_API_URL;

        const mapped: AlumniMember[] = backendUsers.map((u: any) => ({
          id: u.id,
          image: {
            src: u.profile_picture
              ? `${API_BASE_URL}${u.profile_picture}?t=${Date.now()}`
              : "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
          },
          name: `${u.first_name} ${u.last_name}`,
          jobTitle: u.occupation || "Nije navedeno",
          description: u.email || "",
          socialLinks: [],
          isPublic: u.is_public,
        }));

        setAlumniMembers(mapped);
      } catch (err) {
        console.error("Greška pri učitavanju direktorijuma:", err);
      } finally {
        setDirectoryLoading(false);
      }
    };

    loadUsers();

    window.addEventListener("focus", loadUsers);
    return () => window.removeEventListener("focus", loadUsers);
  }, []);

  if (directoryLoading) {
    return (
      <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-[#294a70] min-h-screen">
        <div className="text-center text-white">Učitavanje...</div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
      `}</style>

      <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-[#294a70] min-h-screen">
        <div className="container">
          <div
            className="mx-auto mb-12 max-w-4xl text-center md:mb-18 lg:mb-20 animate-fade-in opacity-0"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 py-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              {heading}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 items-start justify-center gap-x-8 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
            {alumniMembers.map((member: AlumniMember, index: number) => (
              <div
                key={index}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${600 + index * 150}ms`, animationFillMode: "forwards" }}
                onClick={() => { if (!member.isPublic) setShowPrivatePopup(true); }}
              >
                <AlumniMemberCard member={member} />
              </div>
            ))}
          </div>

          {!isLoggedIn && (
            <div
              className="mx-auto mt-14 w-full max-w-md text-center md:mt-20 lg:mt-24 animate-scale-in opacity-0"
              style={{ animationDelay: "1200ms", animationFillMode: "forwards" }}
            >
              <h4 className="mb-3 text-3xl font-bold md:mb-4 md:text-4xl md:leading-[1.3] lg:text-5xl text-white">
                {footer.heading}
              </h4>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">
                {footer.description}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
                <Button {...footer.button} onClick={() => navigate("/enroll")}>
                  {footer.button.title}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {showPrivatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 shadow-xl text-center w-[320px]">
            <h3 className="text-lg font-bold mb-2 text-[#294a70]">Privatni profil</h3>
            <p className="text-gray-600 mb-4">Ovaj profil je privatan i nije dostupan za pregled.</p>
            <button
              onClick={() => setShowPrivatePopup(false)}
              className="px-5 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3854]"
            >
              U redu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const AlumniDirectoryDefaults: Props = {
  tagline: "Mediteran FIT",
  heading: "Naša mreža uspjeha",
  description: "Upoznajte naše bivše studente koji grade uspješne karijere širom svijeta. Pridružite se zajednici koja povezuje, inspirira i podrška.",
  alumniMembers: [],
  footer: {
    heading: "Postanite dio naše priče!",
    description: "Pošaljite prijavu i budite dio naše mreže bivših studenata.",
    button: { title: "Prijavite se", variant: "primary", size: "lg" },
  },
};

export default AlumniDirectory;
