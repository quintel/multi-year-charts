import LocaleMessage from './LocaleMessage';

const Banner = () => {
  return (
    <div className="bg-banner text-gray-100">
      <div className="container mx-auto flex items-stretch gap-3 py-3">
        <div className="mr-auto ml-auto flex items-center">
          <LocaleMessage id="app.banner" />
        </div>
      </div>
    </div>
  );
};

export default Banner;
