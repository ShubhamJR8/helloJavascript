import jobScraperService from './src/services/jobScraperService.js';

// Test URLs for different job sites
const testUrls = [
  'https://www.linkedin.com/jobs/view/123456789',
  'https://www.indeed.com/viewjob?jk=123456789',
  'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=developer',
  'https://stackoverflow.com/jobs/123456/developer-position'
];

async function testScraping() {
  console.log('🧪 Testing Job Scraper Service...\n');

  for (const url of testUrls) {
    console.log(`Testing URL: ${url}`);
    
    try {
      // Test site detection
      const siteType = jobScraperService.detectJobSite(url);
      console.log(`✅ Detected site: ${siteType}`);

      // Test URL validation
      const validation = await jobScraperService.testScraping(url);
      console.log(`✅ Validation result:`, validation.success ? 'SUCCESS' : 'FAILED');
      
      if (validation.success) {
        console.log(`   📋 Extracted data:`, {
          title: validation.data?.title?.substring(0, 50) + '...',
          company: validation.data?.company,
          location: validation.data?.location,
          skillsCount: validation.data?.skills?.length || 0
        });
      } else {
        console.log(`   ❌ Error: ${validation.error}`);
      }

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('---\n');
  }

  console.log('🎉 Scraping tests completed!');
}

// Test skills extraction
function testSkillsExtraction() {
  console.log('🧪 Testing Skills Extraction...\n');

  const testTexts = [
    'We are looking for a JavaScript developer with React experience and Node.js knowledge.',
    'Requirements: Python, Django, PostgreSQL, Docker, AWS experience required.',
    'Must have experience with Java, Spring Boot, and MongoDB.',
    'Looking for a frontend developer proficient in HTML, CSS, JavaScript, and React.'
  ];

  testTexts.forEach((text, index) => {
    const skills = jobScraperService.extractSkillsFromText(text);
    console.log(`Test ${index + 1}:`);
    console.log(`   Text: "${text.substring(0, 60)}..."`);
    console.log(`   Skills: [${skills.join(', ')}]`);
    console.log('');
  });
}

// Test URL validation
function testUrlValidation() {
  console.log('🧪 Testing URL Validation...\n');

  const testUrls = [
    'https://www.linkedin.com/jobs/view/123456789',
    'https://www.indeed.com/viewjob?jk=123456789',
    'https://www.glassdoor.com/Job/jobs.htm',
    'https://stackoverflow.com/jobs/123456/developer',
    'https://github.com/jobs/123456',
    'https://unsupported-site.com/job/123456',
    'invalid-url',
    'https://google.com'
  ];

  testUrls.forEach(url => {
    try {
      const siteType = jobScraperService.detectJobSite(url);
      const isValid = url.startsWith('http');
      console.log(`URL: ${url}`);
      console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
      console.log(`   Site: ${siteType}`);
      console.log('');
    } catch (error) {
      console.log(`URL: ${url} - ❌ Invalid`);
      console.log('');
    }
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Job Scraper Tests\n');
  
  testUrlValidation();
  testSkillsExtraction();
  await testScraping();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testScraping, testSkillsExtraction, testUrlValidation }; 