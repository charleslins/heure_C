import React from "react";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import SectionCard from "../components/common/SectionCard";

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto">
      <SectionCard
        title={t("userProfilePage.title")}
        titleIcon={User}
        titleIconProps={{ className: "w-8 h-8 text-indigo-600" }}
        cardClassName="bg-white shadow-xl rounded-lg"
        headerAreaClassName="p-6 md:p-8 border-b border-slate-200"
        contentAreaClassName="p-6 md:p-8"
        titleTextClassName="text-2xl font-semibold text-slate-800"
      >
        <div className="text-center text-slate-600 py-10 border border-dashed border-slate-300 rounded-md">
          <p className="text-lg">{t("userProfilePage.featureComingSoon")}</p>
          <p className="text-sm mt-2">
            {t("loginPage.nameLabel")}, {t("loginPage.emailLabel")},{" "}
            {t("nav.changePassword")},{" "}
            {t("common.andMore", "and more will be configurable here.")}
          </p>
        </div>
      </SectionCard>
    </div>
  );
};

export default UserProfilePage;
