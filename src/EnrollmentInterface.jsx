import React, { useState } from 'react';
import { User, UserCircle, Gamepad2, CheckCircle, X, GanttChartSquare, BookText } from 'lucide-react';

const EnrollmentInterface = () => {
  // State pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    pseudo: '',
    age: '',
    gender: '',
    handedness: '',
    educationLevel: '',
    gamingFrequency: '',
    typingExperience: '',
    deviceType: '',
    consent: false
  });

  // State pour suivre l'étape de l'inscription
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  
  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Validation de base du formulaire
  const validateStep = () => {
    if (currentStep === 1) {
      return formData.pseudo && formData.age && formData.gender && formData.handedness;
    } else if (currentStep === 2) {
      return formData.educationLevel && formData.gamingFrequency && formData.typingExperience && formData.deviceType;
    } else if (currentStep === 3) {
      return formData.consent;
    }
    return false;
  };
  
  // Passer à l'étape suivante
  const handleNextStep = () => {
    if (validateStep()) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else {
        setFormComplete(true);
      }
    }
  };
  
  // Revenir à l'étape précédente
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Soumettre le formulaire final
  const handleSubmit = () => {
    console.log('Données d\'inscription soumises:', formData);
    // Ici on pourrait envoyer les données à une API ou les stocker localement
    alert('Inscription réussie!');
  };

  // Afficher un message de confirmation si le formulaire est complet
  if (formComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-6xl mx-auto bg-white p-6">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-6 text-green-500 flex justify-center">
            <CheckCircle size={80} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inscription Complétée!</h1>
          <p className="text-gray-600 mb-6">Merci {formData.pseudo} de vous être inscrit(e). Vos données ont été enregistrées avec succès.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-white">
      {/* En-tête de l'interface d'inscription */}
      <header className="p-4 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Gamepad2 size={24} />
            <h1 className="text-xl font-bold">Inscription Joueur</h1>
          </div>
          <div className="text-sm text-gray-300">
            Collecte de données sur la dynamique de frappe
          </div>
        </div>
      </header>
      
      {/* Section principale du formulaire */}
      <div className="flex flex-1">
        {/* Sidebar de gauche */}
        <div className="w-1/4 p-6 bg-gray-50 border-r border-gray-100">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Étapes d'inscription</h2>
            <div className="space-y-4">
              <div 
                className={`flex items-center p-3 rounded-md ${
                  currentStep === 1 ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                }`}
              >
                <div className={`mr-3 ${currentStep === 1 ? 'text-primary-500' : 'text-gray-400'}`}>
                  <User size={20} />
                </div>
                <span>Informations personnelles</span>
              </div>
              
              <div 
                className={`flex items-center p-3 rounded-md ${
                  currentStep === 2 ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                }`}
              >
                <div className={`mr-3 ${currentStep === 2 ? 'text-primary-500' : 'text-gray-400'}`}>
                  <GanttChartSquare size={20} />
                </div>
                <span>Préférences & Expérience</span>
              </div>
              
              <div 
                className={`flex items-center p-3 rounded-md ${
                  currentStep === 3 ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                }`}
              >
                <div className={`mr-3 ${currentStep === 3 ? 'text-primary-500' : 'text-gray-400'}`}>
                  <BookText size={20} />
                </div>
                <span>Confirmation & Consentement</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pourquoi ces informations?</h3>
            <p className="text-sm text-gray-500">
              Ces données nous aident à mieux comprendre les dynamiques de frappe des joueurs 
              et à améliorer l'expérience de jeu en fonction des différents profils.
            </p>
          </div>
        </div>
        
        {/* Formulaire principal */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStep === 1 && "Informations personnelles"}
              {currentStep === 2 && "Préférences & Expérience"}
              {currentStep === 3 && "Confirmation & Consentement"}
            </h2>
            <p className="text-gray-500">
              {currentStep === 1 && "Partagez quelques informations de base à propos de vous"}
              {currentStep === 2 && "Dites-nous en plus sur vos habitudes et expériences"}
              {currentStep === 3 && "Veuillez confirmer vos informations et votre consentement"}
            </p>
          </div>
          
          <div className="flex-1">
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="pseudo" className="block text-gray-700 mb-2">
                    Pseudo / Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    id="pseudo"
                    name="pseudo"
                    value={formData.pseudo}
                    onChange={handleInputChange}
                    placeholder="Entrez votre pseudo"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="age" className="block text-gray-700 mb-2">
                    Âge *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Entrez votre âge"
                    min="5"
                    max="120"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-gray-700 mb-2">
                    Genre *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="">Sélectionnez votre genre</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                    <option value="prefer_not_to_say">Je préfère ne pas répondre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="handedness" className="block text-gray-700 mb-2">
                    Êtes-vous droitier ou gaucher? *
                  </label>
                  <select
                    id="handedness"
                    name="handedness"
                    value={formData.handedness}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="">Sélectionnez votre main dominante</option>
                    <option value="right">Droitier</option>
                    <option value="left">Gaucher</option>
                    <option value="ambidextrous">Ambidextre</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Étape 2: Préférences & Expérience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="educationLevel" className="block text-gray-700 mb-2">
                    Niveau d'éducation *
                  </label>
                  <select
                    id="educationLevel"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="">Sélectionnez votre niveau d'éducation</option>
                    <option value="primary">École primaire</option>
                    <option value="middle">Collège</option>
                    <option value="highschool">Lycée</option>
                    <option value="bachelor">Licence / Bachelor</option>
                    <option value="master">Master / Ingénieur</option>
                    <option value="phd">Doctorat / PhD</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="gamingFrequency" className="block text-gray-700 mb-2">
                    Fréquence de jeu *
                  </label>
                  <select
                    id="gamingFrequency"
                    name="gamingFrequency"
                    value={formData.gamingFrequency}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="">À quelle fréquence jouez-vous aux jeux vidéo?</option>
                    <option value="daily">Quotidiennement</option>
                    <option value="weekly">Plusieurs fois par semaine</option>
                    <option value="monthly">Quelques fois par mois</option>
                    <option value="rarely">Rarement</option>
                    <option value="never">Jamais</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="typingExperience" className="block text-gray-700 mb-2">
                    Expérience de frappe *
                  </label>
                  <select
                    id="typingExperience"
                    name="typingExperience"
                    value={formData.typingExperience}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="">Comment évaluez-vous votre rapidité de frappe?</option>
                    <option value="beginner">Débutant - Frappe lente avec deux doigts</option>
                    <option value="intermediate">Intermédiaire - Utilise plusieurs doigts, vitesse moyenne</option>
                    <option value="advanced">Avancé - Frappe rapide, connaît les positions des touches</option>
                    <option value="expert">Expert - Dactylographe professionnel, très rapide</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="deviceType" className="block text-gray-700 mb-2">
                    Type d'appareil utilisé *
                  </label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="">Sur quel type d'appareil jouez-vous principalement?</option>
                    <option value="desktop">Ordinateur de bureau</option>
                    <option value="laptop">Ordinateur portable</option>
                    <option value="tablet">Tablette</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="console">Console de jeu</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Étape 3: Confirmation & Consentement */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Récapitulatif des informations</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Pseudo:</p>
                      <p className="font-medium">{formData.pseudo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Âge:</p>
                      <p className="font-medium">{formData.age} ans</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Genre:</p>
                      <p className="font-medium">
                        {formData.gender === 'male' && 'Homme'}
                        {formData.gender === 'female' && 'Femme'}
                        {formData.gender === 'other' && 'Autre'}
                        {formData.gender === 'prefer_not_to_say' && 'Préfère ne pas répondre'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Main dominante:</p>
                      <p className="font-medium">
                        {formData.handedness === 'right' && 'Droitier'}
                        {formData.handedness === 'left' && 'Gaucher'}
                        {formData.handedness === 'ambidextrous' && 'Ambidextre'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Niveau d'éducation:</p>
                      <p className="font-medium">
                        {formData.educationLevel === 'primary' && 'École primaire'}
                        {formData.educationLevel === 'middle' && 'Collège'}
                        {formData.educationLevel === 'highschool' && 'Lycée'}
                        {formData.educationLevel === 'bachelor' && 'Licence / Bachelor'}
                        {formData.educationLevel === 'master' && 'Master / Ingénieur'}
                        {formData.educationLevel === 'phd' && 'Doctorat / PhD'}
                        {formData.educationLevel === 'other' && 'Autre'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fréquence de jeu:</p>
                      <p className="font-medium">
                        {formData.gamingFrequency === 'daily' && 'Quotidiennement'}
                        {formData.gamingFrequency === 'weekly' && 'Plusieurs fois par semaine'}
                        {formData.gamingFrequency === 'monthly' && 'Quelques fois par mois'}
                        {formData.gamingFrequency === 'rarely' && 'Rarement'}
                        {formData.gamingFrequency === 'never' && 'Jamais'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Consentement d'utilisation des données</h3>
                  <p className="text-gray-600 mb-4">
                    En cochant cette case, j'accepte que mes données personnelles et mes dynamiques de frappe soient collectées 
                    et utilisées à des fins de recherche et d'amélioration de l'expérience de jeu. Ces données seront traitées 
                    de manière anonyme et confidentielle, conformément aux réglementations en vigueur.
                  </p>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-primary-600"
                    />
                    <label htmlFor="consent" className="ml-2 text-gray-700">
                      J'accepte les conditions mentionnées ci-dessus *
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation entre étapes */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Précédent
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={!validateStep()}
                className={`px-6 py-2 rounded-md ${
                  validateStep() 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-primary-300 text-white cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep()}
                className={`px-6 py-2 rounded-md ${
                  validateStep() 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-primary-300 text-white cursor-not-allowed'
                }`}
              >
                Confirmer l'inscription
              </button>
            )}
          </div>
        </div>
        
        {/* Section d'aide à droite */}
        <div className="w-1/4 p-6 bg-gray-50 border-l border-gray-100 flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
              <UserCircle size={64} className="text-primary-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Besoin d'aide?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Si vous avez des questions concernant l'inscription ou la collecte de données, 
              n'hésitez pas à nous contacter.
            </p>
            <a href="#" className="text-primary-600 text-sm font-medium">
              Contactez-nous →
            </a>
          </div>
          
          <div className="mt-auto">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Avantages de l'inscription</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">
                  <CheckCircle size={16} />
                </span>
                <span>Personnalisation de votre expérience de jeu</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">
                  <CheckCircle size={16} />
                </span>
                <span>Suivi de vos performances et progrès</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">
                  <CheckCircle size={16} />
                </span>
                <span>Participation à l'amélioration de l'intelligence artificielle du jeu</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentInterface; 