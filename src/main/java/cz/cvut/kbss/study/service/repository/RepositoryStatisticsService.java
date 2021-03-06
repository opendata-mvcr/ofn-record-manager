package cz.cvut.kbss.study.service.repository;

import cz.cvut.kbss.study.persistence.dao.PatientRecordDao;
import cz.cvut.kbss.study.persistence.dao.UserDao;
import cz.cvut.kbss.study.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RepositoryStatisticsService implements StatisticsService {

    private final UserDao userDao;

    private final PatientRecordDao recordDao;

    public RepositoryStatisticsService(UserDao userDao,
                                       PatientRecordDao recordDao) {
        this.userDao = userDao;
        this.recordDao = recordDao;
    }

    @Override
    public int getNumberOfInvestigators() {
        return userDao.getNumberOfInvestigators();
    }

    @Override
    public int getNumberOfProcessedRecords() {
        return recordDao.getNumberOfProcessedRecords();
    }
}
