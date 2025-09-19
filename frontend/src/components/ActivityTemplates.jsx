import React from 'react';
import { BookOpen, Users, Award, Briefcase, Heart, Trophy } from 'lucide-react';

const ActivityTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 'conference',
      name: 'Conference Participation',
      icon: BookOpen,
      type: 'conference',
      description: 'Attended a technical or academic conference',
      suggestedCredits: 2,
      fields: {
        organizer: 'Required',
        duration: '1-3 days',
        certificate: 'Participation certificate'
      }
    },
    {
      id: 'workshop',
      name: 'Workshop/Training',
      icon: Users,
      type: 'workshop',
      description: 'Completed a skill development workshop',
      suggestedCredits: 1,
      fields: {
        organizer: 'Training institute',
        duration: '1-7 days',
        certificate: 'Completion certificate'
      }
    },
    {
      id: 'certification',
      name: 'Professional Certification',
      icon: Award,
      type: 'certification',
      description: 'Earned a professional certification',
      suggestedCredits: 3,
      fields: {
        organizer: 'Certifying body',
        duration: 'Varies',
        certificate: 'Certification document'
      }
    },
    {
      id: 'internship',
      name: 'Internship',
      icon: Briefcase,
      type: 'internship',
      description: 'Completed an internship program',
      suggestedCredits: 5,
      fields: {
        organizer: 'Company/Organization',
        duration: '1-6 months',
        certificate: 'Internship letter'
      }
    },
    {
      id: 'volunteer',
      name: 'Volunteer Work',
      icon: Heart,
      type: 'volunteer',
      description: 'Participated in volunteer activities',
      suggestedCredits: 2,
      fields: {
        organizer: 'NGO/Organization',
        duration: 'Varies',
        certificate: 'Volunteer certificate'
      }
    },
    {
      id: 'competition',
      name: 'Competition',
      icon: Trophy,
      type: 'competition',
      description: 'Participated in academic/technical competition',
      suggestedCredits: 3,
      fields: {
        organizer: 'Organizing committee',
        duration: '1-3 days',
        certificate: 'Participation/Award certificate'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <Icon className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold">{template.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            <div className="space-y-2 text-xs text-gray-500">
              <p><span className="font-medium">Suggested Credits:</span> {template.suggestedCredits}</p>
              <p><span className="font-medium">Organizer:</span> {template.fields.organizer}</p>
              <p><span className="font-medium">Duration:</span> {template.fields.duration}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTemplates;
