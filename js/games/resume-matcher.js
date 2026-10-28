/**
 * Interview Arcade — Game 4: Resume Keyword Matcher
 * Deterministic client-side resume vs job description analyzer.
 * Zero data leaves the user's browser.
 */

import { SKILL_CATEGORIES, ACTION_VERBS, SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION } from '../data/resume-dictionaries.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createResumeView(params, container) {
  let resumeText = '';
  let jdText = '';
  let analysisResult = null;

  function init() {
    render();
    bindEvents();
  }

  function render() {
    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Career Tools</span>
              <h2>Resume Keyword Scanner</h2>
            </div>
            <div class="game-controls-bar">
              <button type="button" id="load-sample-btn" class="btn btn-sm btn-subtle">Load Sample Tech Pair</button>
              <button type="button" id="clear-resume-btn" class="btn btn-sm btn-subtle">Clear Inputs</button>
            </div>
          </div>

          <!-- Privacy & Transparency Banner -->
          <div class="notice-box notice-info" style="margin-bottom: var(--space-md);">
            <div>
              <strong>🔒 Client-Side Only Analysis:</strong> Your resume and job description remain completely inside your device's browser memory. Zero text is uploaded or transmitted across any network.
            </div>
          </div>

          <!-- Text Input Panes -->
          <div class="resume-inputs-grid">
            <div class="resume-textarea-group">
              <label for="resume-input"><strong>Your Resume Text</strong></label>
              <textarea id="resume-input" class="resume-textarea" placeholder="Paste your plain-text resume here...">${resumeText}</textarea>
            </div>
            <div class="resume-textarea-group">
              <label for="jd-input"><strong>Target Job Description (JD)</strong></label>
              <textarea id="jd-input" class="resume-textarea" placeholder="Paste the target job description here...">${jdText}</textarea>
            </div>
          </div>

          <div style="text-align: center; margin: var(--space-md) 0;">
            <button type="button" id="analyze-btn" class="btn btn-primary btn-lg">
              🔍 Run Keyword Overlap Analysis
            </button>
          </div>

          <!-- Analysis Results Container -->
          <div id="analysis-output">
            ${analysisResult ? renderAnalysisView(analysisResult) : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderAnalysisView(result) {
    return `
      <div class="card" style="margin-top: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-xs); border-bottom: var(--border-width-sm) solid var(--color-border); padding-bottom: var(--space-sm);">
          <div>
            <h3>Keyword Coverage Assessment</h3>
            <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">
              Deterministic keyword scan comparing required technologies against resume content.
            </p>
          </div>
          <div style="text-align: right;">
            <span class="stat-label">Coverage Match</span>
            <div style="font-family: var(--font-mono); font-size: var(--font-size-2xl); font-weight: bold; color: ${result.matchScore >= 70 ? 'var(--color-success)' : result.matchScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)'};">
              ${result.matchScore}%
            </div>
          </div>
        </div>

        <!-- Matched Skills -->
        <div style="margin-top: var(--space-md);">
          <h4 style="color: var(--color-success); margin-bottom: var(--space-2xs);">
            ✓ Matched Skills Found (${result.matchedSkills.length})
          </h4>
          <div class="match-pills-wrap">
            ${result.matchedSkills.length > 0 
              ? result.matchedSkills.map(s => `<span class="skill-pill pill-matched">✓ ${s}</span>`).join('')
              : '<span style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">No target JD technical skills found in resume.</span>'}
          </div>
        </div>

        <!-- Missing Skills -->
        <div style="margin-top: var(--space-md);">
          <h4 style="color: var(--color-error); margin-bottom: var(--space-2xs);">
            ⚠️ High-Priority Missing Keywords (${result.missingSkills.length})
          </h4>
          <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">
            These skills appear in the Job Description but were not detected in your resume text:
          </p>
          <div class="match-pills-wrap">
            ${result.missingSkills.length > 0 
              ? result.missingSkills.map(s => `<span class="skill-pill pill-missing">✗ ${s}</span>`).join('')
              : '<span style="font-size: var(--font-size-xs); color: var(--color-success);">Outstanding! All JD skills detected in resume.</span>'}
          </div>
        </div>

        <!-- Action Verbs -->
        <div style="margin-top: var(--space-md);">
          <h4 style="color: var(--color-info); margin-bottom: var(--space-2xs);">
            ⚡ Action & Impact Verbs Detected (${result.detectedVerbs.length})
          </h4>
          <div class="match-pills-wrap">
            ${result.detectedVerbs.length > 0 
              ? result.detectedVerbs.map(v => `<span class="skill-pill pill-verb">✦ ${v}</span>`).join('')
              : '<span style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">No standard engineering impact verbs detected. Consider using words like "engineered", "optimized", "architected".</span>'}
          </div>
        </div>

        <!-- Actionable Recommendations -->
        <div style="margin-top: var(--space-lg); background-color: var(--color-bg-subtle); padding: var(--space-md); border-radius: var(--radius-sm); border: var(--border-width-sm) solid var(--color-border);">
          <h4 style="margin-bottom: var(--space-2xs);">Actionable Optimization Tips</h4>
          <ul style="margin-left: var(--space-md); font-size: var(--font-size-sm); color: var(--color-ink);">
            ${result.suggestions.map(s => `<li style="margin-bottom: var(--space-3xs);">${s}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top: var(--space-md); font-size: var(--font-size-xs); color: var(--color-ink-faint); font-style: italic;">
          * Note: This score is a technical keyword overlap estimate, not a commercial ATS ranking or employment guarantee. Always truthfully represent your actual technical competence.
        </div>
      </div>
    `;
  }

  function bindEvents() {
    const resumeInput = container.querySelector('#resume-input');
    const jdInput = container.querySelector('#jd-input');

    if (resumeInput) {
      resumeInput.addEventListener('input', (e) => {
        resumeText = e.target.value;
      });
    }

    if (jdInput) {
      jdInput.addEventListener('input', (e) => {
        jdText = e.target.value;
      });
    }

    const loadSampleBtn = container.querySelector('#load-sample-btn');
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', () => {
        resumeText = SAMPLE_RESUME;
        jdText = SAMPLE_JOB_DESCRIPTION;
        audio.click();
        render();
        bindEvents();
      });
    }

    const clearBtn = container.querySelector('#clear-resume-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        resumeText = '';
        jdText = '';
        analysisResult = null;
        audio.click();
        render();
        bindEvents();
      });
    }

    const analyzeBtn = container.querySelector('#analyze-btn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        runAnalysis();
      });
    }
  }

  function runAnalysis() {
    if (!resumeText.trim() || !jdText.trim()) {
      alert('Please provide both resume text and a job description to analyze overlap.');
      return;
    }

    audio.click();
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    // 1. Extract all JD skills
    const allKnownSkills = [];
    Object.values(SKILL_CATEGORIES).forEach(categorySkills => {
      allKnownSkills.push(...categorySkills);
    });

    function createSkillRegex(skill) {
      const escaped = escapeRegex(skill);
      if (/[\W_]$/.test(skill)) {
        return new RegExp(`(?:^|[\\s,.;:!?/()])${escaped}(?=[\\s,.;:!?/()]|$)`, 'i');
      }
      return new RegExp(`\\b${escaped}\\b`, 'i');
    }

    const jdSkills = new Set();
    allKnownSkills.forEach(skill => {
      const regex = createSkillRegex(skill);
      if (regex.test(jdLower)) {
        jdSkills.add(skill);
      }
    });

    // 2. Extract Resume skills
    const matchedSkills = [];
    const missingSkills = [];

    jdSkills.forEach(skill => {
      const regex = createSkillRegex(skill);
      if (regex.test(resumeLower)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // 3. Extract Action Verbs in Resume
    const detectedVerbs = [];
    ACTION_VERBS.forEach(verb => {
      const regex = new RegExp(`\\b${escapeRegex(verb)}\\b`, 'i');
      if (regex.test(resumeLower)) {
        detectedVerbs.push(verb);
      }
    });

    // Calculate score
    const totalJdSkills = jdSkills.size;
    const matchScore = totalJdSkills > 0 ? Math.round((matchedSkills.length / totalJdSkills) * 100) : 50;

    // Suggestions
    const suggestions = [];
    if (missingSkills.length > 0) {
      suggestions.push(`If you have verified experience with <strong>${missingSkills.slice(0, 4).join(', ')}</strong>, ensure they appear in your Skills or Project bullet points.`);
    }
    if (detectedVerbs.length < 3) {
      suggestions.push('Enhance bullet point impact by starting sentences with strong technical verbs (e.g., "Engineered", "Optimized", "Architected").');
    }
    if (!/\d+[%ms|k|x]/i.test(resumeText)) {
      suggestions.push('Add measurable outcome metrics (e.g., "reduced latency by 35%", "scaled to 1,500 users") to substantiate your project contributions.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Resume displays strong technical alignment with target JD keywords and active phrasing.');
    }

    analysisResult = {
      matchScore,
      matchedSkills,
      missingSkills,
      detectedVerbs,
      suggestions
    };

    if (matchScore >= 70) {
      audio.win();
    } else {
      audio.correct();
    }

    // Record session
    progress.recordSession({
      gameId: 'resume-matcher',
      gameTitle: 'Resume Keyword Matcher',
      difficulty: 'medium',
      durationSeconds: 15,
      score: matchScore,
      maxScore: 100,
      questionsAnswered: totalJdSkills,
      correctAnswers: matchedSkills.length,
      incorrectAnswers: missingSkills.length,
      tags: ['Resume', 'Career', 'Keywords']
    });

    const outputContainer = container.querySelector('#analysis-output');
    if (outputContainer) {
      outputContainer.innerHTML = renderAnalysisView(analysisResult);
      outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  init();

  return {
    destroy: () => {}
  };
}
