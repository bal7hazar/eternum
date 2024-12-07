import { ReactComponent as EternumWordsLogo } from "@/assets/icons/eternum_words_logo.svg";
import { ReactComponent as Lock } from "@/assets/icons/lock.svg";
import { ReactComponent as TreasureChest } from "@/assets/icons/treasure-chest.svg";
import { useDojo } from "@/hooks/context/DojoContext";
import { usePlayerRealms } from "@/hooks/helpers/useRealm";
import Button from "@/ui/elements/Button";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { env } from "../../../env";
import { getUnusedSeasonPasses, SeasonPassRealm } from "../components/cityview/realm/SettleRealmComponent";
import { Controller } from "../modules/controller/Controller";
import { SettleRealm, StepOne } from "../modules/onboarding/Steps";

export const OnboardingOverlay = ({ controller }: { controller?: boolean }) => {
  return (
    <div className="fixed top-6 right-6 flex justify-center gap-2 items-center z-50">
      <Button
        className={`!h-8 !w-40 normal-case font-normal flex items-center rounded-md !text-md !px-3 !text-black shadow-[0px_4px_4px_0px_#00000040] border border-[0.5px] !border-[#F5C2971F] backdrop-blur-xs bg-white/5 hover:scale-105 hover:-translate-y-1 `}
        variant="default"
      >
        <TreasureChest className="!w-5 !h-5 mr-1 md:mr-2 fill-gold text-gold self-center" />
        <a
          className="text-gold cursor-pointer"
          href={`${
            env.VITE_PUBLIC_DEV
              ? "https://empire-next.realms.world/season-passes"
              : "https://empire.realms.world/season-passes"
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Mint Season Pass
        </a>
      </Button>
      {controller && (
        <Controller
          className="!text-black !h-10 w-24 normal-case font-normal  !bg-[#FCB843]  "
          iconClassName="!fill-black"
        />
      )}
    </div>
  );
};

export const StepContainer = ({
  children,
  bottomChildren,
  tos = true,
  transition = true,
}: {
  children: React.ReactNode;
  bottomChildren?: React.ReactNode;
  tos?: boolean;
  transition?: boolean;
}) => {
  const width = "max-w-[456px] w-[33vw]";
  const height = "max-h-[316px] h-[33vh]";
  const size = `${width} ${height}`;
  return (
    <motion.div
      className="flex justify-center z-50 px-4 md:px-0 flex-col"
      initial={transition ? { opacity: 0 } : undefined}
      animate={transition ? { opacity: 1, y: 20 } : undefined}
      exit={transition ? { opacity: 0 } : undefined}
      transition={transition ? { type: "ease-in-out", stiffness: 3, duration: 0.2 } : undefined}
    >
      <div className="">
        <div
          className={`backdrop-blur-lg bg-black/20 self-center border-[0.5px] border-gradient rounded-lg p-6 md:p-12 text-gold w-full overflow-hidden relative z-50 backdrop-filter backdrop-blur-[24px] ${size} 
          shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]`}
        >
          <div className="w-full text-center">
            <div className="mx-auto flex mb-4 md:mb-10">
              <EternumWordsLogo className="fill-current w-64 stroke-current mx-auto" />
            </div>
          </div>
          {children}
        </div>
      </div>

      {tos && (
        <div className="mt-4">
          <div className={`relative ${width}`}>
            <div className="w-full flex justify-center">
              <Lock className="w-4 h-4 fill-current relative bottom-0.45 mr-3" />
              <p className="text-xs text-center align-bottom my-auto">
                By continuing you are agreeing to Eternum's <span className="inline underline">Terms of Service</span>
              </p>
            </div>
            {bottomChildren && bottomChildren}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const OnboardingContainer = ({
  children,
  backgroundImage,
  controller = true,
}: {
  children: React.ReactNode;
  backgroundImage: string;
  controller?: boolean;
}) => {
  return (
    <div className="relative min-h-screen w-full pointer-events-auto ">
      <img
        className="absolute h-screen w-screen object-cover"
        src={`/images/covers/${backgroundImage}.png`}
        alt="Cover"
      />
      <div className="absolute z-10 w-screen h-screen flex justify-center flex-wrap self-center">
        {<OnboardingOverlay controller={controller} />}
        {children}
      </div>
    </div>
  );
};

export const Onboarding = ({ backgroundImage }: { backgroundImage: string }) => {
  const [settleRealm, setSettleRealm] = useState<boolean>(false);
  const bottomChildren = useMemo(() => <SeasonPassButton setSettleRealm={setSettleRealm} />, [setSettleRealm]);

  return (
    <>
      {settleRealm ? (
        <OnboardingContainer backgroundImage={backgroundImage}>
          <SettleRealm onPrevious={() => setSettleRealm(false)} />
        </OnboardingContainer>
      ) : (
        <OnboardingContainer backgroundImage={backgroundImage}>
          <StepContainer bottomChildren={bottomChildren}>
            <StepOne />
          </StepContainer>
        </OnboardingContainer>
      )}
    </>
  );
};

const SeasonPassButton = ({ setSettleRealm }: { setSettleRealm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const {
    account: { account },
  } = useDojo();

  const [seasonPassRealms, setSeasonPassRealms] = useState<SeasonPassRealm[]>([]);

  const realms = usePlayerRealms();

  useEffect(() => {
    getUnusedSeasonPasses(account.address, realms).then((unsettledSeasonPassRealms) => {
      setSeasonPassRealms(unsettledSeasonPassRealms);
    });
  }, [realms]);

  return (
    <Button
      onClick={seasonPassRealms.length > 0 ? () => setSettleRealm((prev) => !prev) : undefined}
      className="mt-8 w-full h-12 !text-black !bg-gold !normal-case rounded-md hover:scale-105 hover:-translate-y-1"
    >
      {seasonPassRealms.length === 0 ? (
        <div className="flex items-center">
          <TreasureChest className="!w-5 !h-5 mr-1 md:mr-2 fill-black text-black" />
          <a
            className="text-black cursor-pointer text-lg"
            href={`https://market.realms.world/collection/0x057675b9c0bd62b096a2e15502a37b290fa766ead21c33eda42993e48a714b80`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Season Pass
          </a>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-black/20 rounded-xl mr-1 md:mr-2 flex justify-center align-bottom text-center items-center align-bottom">
            {seasonPassRealms.length}
          </div>
          Redeem Season Pass
        </div>
      )}
    </Button>
  );
};
