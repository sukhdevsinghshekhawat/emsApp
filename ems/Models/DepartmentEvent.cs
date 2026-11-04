using ems.Models;

namespace ems.Models
{
    public class DepartmentEvent
    {
        public int EventId { get; set; }

        public Event? Event { get; set; }
        public int DepartmentId { get; set; }

        public Department? Department { get; set; }
    }

}