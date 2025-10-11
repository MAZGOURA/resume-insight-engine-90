import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Award, Users, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <Droplets className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="text-indigo-300 font-medium text-sm">
                ANAS FRAGRANCES
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
              {t("about.title")}
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              {t("about.subtitle")}
            </p>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-8 py-3 text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
              {t("about.exploreCollection")}
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Story Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t("about.journeyTitle")}{" "}
                <span className="text-indigo-500">{t("header.story")}</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about.journeySubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-full h-80 shadow-xl"></div>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold mb-4">
                  {t("about.beginningTitle")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("about.beginningText1")}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t("about.beginningText2")}
                </p>
                <Button
                  variant="outline"
                  className="border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                >
                  {t("about.learnMore")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t("about.missionTitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about.missionSubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">
                    {t("about.qualityTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("about.qualityText")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">
                    {t("about.customerFocusTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("about.customerFocusText")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">
                    {t("about.sustainabilityTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("about.sustainabilityText")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
                The Founder
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Meet the visionary behind ANAS FRAGRANCES
              </p>
            </div>

            <div className="flex justify-center">
              <Card className="bg-card/50 backdrop-blur-sm border-border/20 text-center max-w-md w-full">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl font-bold text-indigo-800">
                      AM
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">
                    Anas Moudkiri
                  </h3>
                  <p className="text-indigo-500 mb-4 text-lg">
                    Founder & Master Perfumer
                  </p>
                  <p className="text-muted-foreground">
                    With over 15 years of experience in the fragrance industry,
                    Anas founded ANAS FRAGRANCES with a passion for creating
                    unique, high-quality perfumes that capture the essence of
                    Morocco. His expertise in blending traditional techniques
                    with modern innovation has made ANAS FRAGRANCES a leader in
                    the luxury fragrance market.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
