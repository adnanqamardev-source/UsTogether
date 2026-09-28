@echo off
echo ============================================
echo  GITHUB REPO CLEANUP SCRIPT
echo ============================================
echo.
echo IMPORTANT: Set GITHUB_TOKEN with delete_repo scope first!
echo Export: $env:GITHUB_TOKEN = "your_new_token_here"
echo.
echo ============================================
echo  STEP 1: Delete useless repos
echo ============================================
echo.
echo Deleting Md-Adnan-Qamar-Portfolio...
gh repo delete Md-Adnan-Qamar-Portfolio --yes
echo Deleting Excel-Data-Analytics-Dashboard...
gh repo delete Excel-Data-Analytics-Dashboard --yes
echo Deleting yt-dlp...
gh repo delete yt-dlp --yes
echo Deleting omniroute-render...
gh repo delete omniroute-render --yes
echo Deleting ReadyForge...
gh repo delete ReadyForge --yes
echo.
echo ============================================
echo  STEP 2: Rename Portfolio_ to outdated-portfolio
echo ============================================
echo.
echo Renaming Portfolio_...
gh repo rename -R adnanqamardev-source/Portfolio_ outdated-portfolio --yes
echo.
echo ============================================
echo  Cleanup complete! Check remaining repos with:
echo  gh repo list adnanqamardev-source
echo ============================================
echo.
pause
