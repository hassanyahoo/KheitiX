import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';

/**
 * FieldNew Page (Placeholder)
 * Route: /fields/new
 * Register a new wheat or cotton field in Khairpur
 */
export default function FieldNew() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/fields');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/fields')}
          className="min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center text-dark-brown/70 hover:text-leaf-green hover:bg-white transition-colors"
          aria-label="Back to fields"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark-brown">
            {t('newField') || 'New Field'}
          </h1>
          <p className="text-base text-dark-brown/70">
            Register your land in Khairpur Mirs
          </p>
        </div>
      </div>

      {/* Field Form Card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-semibold text-dark-brown mb-1.5">
              Field Name
            </label>
            <input
              type="text"
              placeholder="e.g. South Wheat Plot"
              defaultValue="East Plot - Gambat"
              className="w-full h-12 px-4 rounded-xl border border-[#D5C9B1] bg-white text-base text-dark-brown focus:outline-none focus:border-leaf-green"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-dark-brown mb-1.5">
              Crop Type
            </label>
            <select
              defaultValue="wheat"
              className="w-full h-12 px-4 rounded-xl border border-[#D5C9B1] bg-white text-base text-dark-brown focus:outline-none focus:border-leaf-green"
            >
              <option value="wheat">Wheat (گندم / ڪڻڪ)</option>
              <option value="cotton">Cotton (کپاس / ڦٽيون)</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-dark-brown mb-1.5">
              Field Size (Acres)
            </label>
            <input
              type="number"
              placeholder="e.g. 5"
              defaultValue="4"
              className="w-full h-12 px-4 rounded-xl border border-[#D5C9B1] bg-white text-base text-dark-brown focus:outline-none focus:border-leaf-green"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-dark-brown mb-1.5">
              Taluka / Location in Khairpur
            </label>
            <select
              defaultValue="kot_diji"
              className="w-full h-12 px-4 rounded-xl border border-[#D5C9B1] bg-white text-base text-dark-brown focus:outline-none focus:border-leaf-green"
            >
              <option value="khairpur">Khairpur City</option>
              <option value="kot_diji">Kot Diji</option>
              <option value="gambat">Gambat</option>
              <option value="kingri">Kingri</option>
              <option value="sobhodero">Sobhodero</option>
              <option value="nara">Nara</option>
              <option value="thari_mirwah">Thari Mirwah</option>
              <option value="faiz_ganj">Faiz Ganj</option>
            </select>
          </div>

          <div className="pt-4 space-y-3">
            <Button type="submit" variant="primary">
              Save Field
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/fields')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
