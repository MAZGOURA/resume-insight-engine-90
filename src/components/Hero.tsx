import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplets, Sparkles, Atom, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-6 w-6 text-indigo-400 mr-2" />
            <span className="text-indigo-300 font-medium text-lg">
              {t("hero.title")}
            </span>
          </div>

          <h1 className="font-mono text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            {t("hero.title")}
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/mall">
              <Button
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl px-8 py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Droplets className="h-5 w-5 mr-2" />
                {t("hero.explore")}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-indigo-400 text-indigo-300 hover:bg-indigo-500/10 rounded-2xl px-8 py-6 text-lg font-medium transition-all duration-300"
              >
                <Atom className="h-5 w-5 mr-2" />
                {t("hero.view")}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-16">
            <div className="flex items-center text-indigo-200">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <Atom className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-2xl">100+</div>
                <div className="text-sm">{t("hero.molecular")}</div>
              </div>
            </div>
            <div className="flex items-center text-indigo-200">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <Sparkles className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-2xl">4.9/5</div>
                <div className="text-sm">{t("hero.satisfaction")}</div>
              </div>
            </div>
            <div className="flex items-center text-indigo-200">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <Droplets className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-2xl">500+</div>
                <div className="text-sm">{t("hero.notes")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements for visual enhancement */}
      <div className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-indigo-500/30 animate-pulse"></div>
      <div className="absolute top-1/3 right-20 w-6 h-6 rounded-full bg-purple-500/30 animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 rounded-full bg-indigo-400/30 animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 right-1/3 w-5 h-5 rounded-full bg-purple-400/30 animate-pulse delay-1500"></div>
    </section>
  );
};
