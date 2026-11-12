package services

import (
	"fmt"
	"time"

	"tumata-backend/internal/models"

	"gorm.io/gorm"
)

type ConflictService struct {
	db *gorm.DB
}

func NewConflictService(db *gorm.DB) *ConflictService {
	return &ConflictService{db: db}
}

type ConflictDetail struct {
	Type        string `json:"type"` // "schedule_overlap", "team_overlap", "venue_overlap"
	Message     string `json:"message"`
	ProjectName string `json:"project_name"`
	EventTitle  string `json:"event_title"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
}

// CheckEventConflicts checks if an event overlaps with other scheduled events or team assignments
func (s *ConflictService) CheckEventConflicts(projectID uint, startTime, endTime time.Time, excludeEventID uint) []ConflictDetail {
	var conflicts []ConflictDetail

	// 1. Check time overlap with other events
	var overlappingEvents []models.Event
	query := s.db.Preload("Project.Client").
		Where("id != ? AND start_time < ? AND end_time > ?", excludeEventID, endTime, startTime)
	query.Find(&overlappingEvents)

	for _, ev := range overlappingEvents {
		projName := "Unknown Project"
		if ev.Project != nil {
			if ev.Project.Client != nil {
				projName = fmt.Sprintf("%s (%s)", ev.Project.Client.Name, ev.Project.ProjectNumber)
			} else {
				projName = ev.Project.ProjectNumber
			}
		}

		conflicts = append(conflicts, ConflictDetail{
			Type:        "schedule_overlap",
			Message:     fmt.Sprintf("Jadwal beririsan dengan acara '%s' pada proyek %s di %s", ev.Title, projName, ev.Location),
			ProjectName: projName,
			EventTitle:  ev.Title,
			StartTime:   ev.StartTime.Format("02 Jan 15:04"),
			EndTime:     ev.EndTime.Format("15:04"),
		})
	}

	return conflicts
}

// CheckTeamMemberConflict checks if any team member of this project is assigned to another project with an overlapping event
func (s *ConflictService) CheckTeamMemberConflict(projectID uint, startTime, endTime time.Time) []ConflictDetail {
	var conflicts []ConflictDetail

	// Find all members assigned to this project
	var currentMembers []models.ProjectMember
	s.db.Where("project_id = ?", projectID).Find(&currentMembers)
	if len(currentMembers) == 0 {
		return conflicts
	}

	for _, member := range currentMembers {
		// Find other projects where this member is assigned
		var otherAssignments []models.ProjectMember
		s.db.Preload("User").Preload("Project.Client").
			Where("user_id = ? AND project_id != ?", member.UserID, projectID).
			Find(&otherAssignments)

		for _, other := range otherAssignments {
			// Find events of the other project that overlap with current event
			var overlappingEvents []models.Event
			s.db.Where("project_id = ? AND start_time < ? AND end_time > ?", other.ProjectID, endTime, startTime).
				Find(&overlappingEvents)

			for _, ev := range overlappingEvents {
				userName := "Anggota tim"
				if other.User != nil {
					userName = other.User.Name
				}
				clientName := "Proyek lain"
				if other.Project != nil && other.Project.Client != nil {
					clientName = other.Project.Client.Name
				}

				conflicts = append(conflicts, ConflictDetail{
					Type:        "team_overlap",
					Message:     fmt.Sprintf("Anggota tim %s (%s) sudah ditugaskan pada proyek %s di acara '%s'", userName, member.RoleInProject, clientName, ev.Title),
					ProjectName: clientName,
					EventTitle:  ev.Title,
					StartTime:   ev.StartTime.Format("02 Jan 15:04"),
					EndTime:     ev.EndTime.Format("15:04"),
				})
			}
		}
	}

	return conflicts
}
