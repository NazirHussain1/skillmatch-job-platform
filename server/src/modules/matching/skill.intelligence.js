/**
 * Skill Intelligence System
 * Handles skill normalization, ontology mapping, and intelligent matching
 */

class SkillIntelligence {
  constructor() {
    // Skill synonym mapping (ontology)
    this.skillOntology = {
      // JavaScript ecosystem
      'react': ['reactjs', 'react.js', 'react js'],
      'vue': ['vuejs', 'vue.js', 'vue js'],
      'angular': ['angularjs', 'angular.js', 'angular js'],
      'node': ['nodejs', 'node.js', 'node js'],
      'express': ['expressjs', 'express.js'],
      'next': ['nextjs', 'next.js'],
      'nuxt': ['nuxtjs',